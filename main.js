var exports = module.exports = {};

const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const botconfig = require("./botData.json");
const logger = require('./logs/logger.js')

const now = require("performance-now");
const chalk = require('chalk');

/*
logger.log( {level: 'info',
message: 'What time is the testing at?',
action: 'a question'});
*/


const Enmap = require("enmap");
//create command collection and get all command files
client.commands = new Discord.Collection(); // Collection for all commands
client.aliases = new Discord.Collection(); // Collection for all aliases of every command

client.userprofile = new Enmap({ name: "profile" });
exports.up = client.userprofile;


const modules = ['Administration', 'Fun', 'Management', 'Moderation', 'Misc', 'Roles', 'Users'];
// This will be the list of the names of all modules (folder) your bot owns

modules.forEach(c => {
    fs.readdir(`./commands/${c}/`, (err, files) => { // Here we go through all folders (modules)
        if (err) throw err; // If there is error, throw an error in the console
        console.log(`[Commandlogs] Loaded ${files.length} commands of module ${c}`);
        // When commands of a module are successfully loaded, you can see it in the console

        files.forEach(f => { // Now we go through all files of a folder (module)
            const command = require(`./commands/${c}/${f}`); // Location of the current command file
            client.commands.set(command.name, command); // Now we add the commmand in the client.commands Collection which we defined in previous code
            client.aliases.set(command.name, command.aliases);
        });
    });
});

const channels = require('./channels.json');
const ac = channels.allowed;
var count = ac.length;

const levels = require('./levels.json');
const lvls = levels.newrole;
var count2 = lvls.length;

const app = require("./api/app");

const commandPrefix = config.settings.prefix;
const cooldowns = new Discord.Collection();


// Executed when the bot is ready!
client.on('ready', async () => {
    // Console output for showing that the bot is running.
    console.log(chalk.greenBright('\n>> Bot is ready!'));
    console.log('>> Logged in as ' + client.user.username);
    //client.user.setPresence({ game: { name: botconfig.bot_game }} status: botconfig.bot_status})
    client.user.setActivity(botconfig.bot_game);
    client.user.setStatus(botconfig.bot_status)
    console.log(`Connected as ${client.user.tag}`)
    client.appInfo = await client.fetchApplication().then(application => {
        return application;
    }
    )
    //console.log(client.appInfo)
    // This is starting the app.
    app.startApp(client);
    //logger.log('info', 'The bot is online!');
});

//other loggins
/*client.on('warn', m => logger.log('warn', m));
client.on('error', m => logger.log('error', m));

process.on('uncaughtException', error => logger.log('error', error));*/

// If your code editor says that () => is an error, change it to function()
// Executed when message event
//welcomemessage
client.on("guildMemberAdd", (member) => {
    //look for a channel with this name
    const channel = member.guild.channels.find(ch => ch.name === 'arrivals');

    //channel not found
    if (!channel) return;
    let guild = member.guild;
    //channel.send(`Welcome ${member} to ${guild}!! ` + config.welcome);
    //channel.send(config.welcome);
    var wel = config.settings.welcome;
    var str = wel.replace(/{member}/g, `${member}`);
    var welcome = str.replace(/{server}/g, `**${guild}**`);
    channel.send(welcome);
});

client.on("guildMemberRemove", (member) => {
    //look for a channel with this name
    const channel = member.guild.channels.find(ch => ch.name === 'departures');

    //channel not found
    if (!channel) return;

    //get server and set the goodbye message up with the correct inputs
    let guild = member.guild;
    var gb = config.settings.goodbye;
    var str = gb.replace(/{member}/g, `${member}`);
    var goodbye = str.replace(/{server}/g, `${guild}`);
    channel.send(goodbye);
});





//message/command handling within discord
client.on('message', message => {

    //check message prefix and the bot
    if (!message.content.startsWith(config.settings.prefix) || message.author.bot) return;

	/******************
	 * enmap xp
	 ******************/

    //makes sure this isn't in a DM
    if (message.guild) {
        //a key variable to simplfy the worth of points
        const key = `${message.guild.id}-${message.author.id}`;

        //triggers on new users
        client.userprofile.ensure(key, {
            user: message.author.id,
            guild: message.guild.id,
            points: 10,
            level: 1,
            coins: 500,
            warnlevel: 0,
            bgcolor: '#f2f2f2',
            maincolor: '#BAF0BA',
            txtcolor: '#23272A',
            title: 'This is a Title',
            info: 'This is some text to act as my own personal status/info/about me. Whatever. Good news! It wraps text on its own.',
            headerimg: 'https://pbs.twimg.com/media/CkCp_VhWYAAJcrU.jpg',
            lastSeen: new Date()
        });
        //client.userprofile.inc(key, "points");
        //var newpoints=0;
        const newcoins = Math.floor(Math.random() * 7) + 8;
        client.userprofile.math(key, "+", newcoins, "coins");

        if (ac.length === 0) {
            const newpoints = Math.floor(Math.random() * 7) + 15;
            client.userprofile.math(key, "+", newpoints, "points");

            // Calculate the user's current level
            const curLevel = Math.floor(0.1 * Math.sqrt(client.userprofile.get(key, "points"))) + 1;

            // Act upon level up by sending a message and updating the user's level in enmap.
            if (client.userprofile.get(key, "level") < curLevel) {
                let lvlID = config.emojis.lvlup;
                message.reply(`${lvlID}**Congrats!** You've leveled up to **Level ${curLevel}**! Keep going!`);
                client.userprofile.math(key, "+", 200, "coins");
                client.userprofile.set(key, curLevel, "level");
            }

            //checks to see if level is at needed one fornew rank
            if (curLevel == 5) {
                let addrankup = message.member;
                let roleName = 'lvl 5'
                let role = message.guild.roles.find(x => x.name == roleName);
                if (!role) {
                    message.guild.createRole({
                        name: roleName
                    });
                }
                let lvlRole = message.guild.roles.find(x => x.name == roleName);
                if (message.member.roles.has(lvlRole.id)) {
                    //do nothing
                }
                else {
                    message.channel.send("**Congrats!** You've received a new role!**");
                    addrankup.addRole(lvlRole.id).catch(console.error);
                }
            }
        }//end of ac.length

        else {
            for (i = 0; i < count; i++) {
                //console.log(ac[i].name)
                var name = ac[i].name;
                if (message.channel.name === name) {
                    const newpoints = Math.floor(Math.random() * 7) + 15;
                    client.userprofile.math(key, "+", newpoints, "points");
                }
            }//end of for loop

            // Calculate the user's current level
            const curLevel = Math.floor(0.1 * Math.sqrt(client.userprofile.get(key, "points"))) + 1;

            // Act upon level up by sending a message and updating the user's level in enmap.
            if (client.userprofile.get(key, "level") < curLevel) {
                let lvlID = config.emojis.lvlup;
                message.reply(`${lvlID}**Congrats!** You've leveled up to **Level ${curLevel}**! Keep going!`);
                client.userprofile.math(key, "+", 200, "coins");
                client.userprofile.set(key, curLevel, "level");
            }

            for (i = 0; i < count2; i++) {
                //console.log(ac[i].name)
                //console.log(lvls[i].level)
                var level = lvls[i].level;
                var lvlName = lvls[i].rolename;
                if (curLevel == level) {
                    let addrankup = message.member;
                    let roleName = `${lvlName}`

                    let role = message.guild.roles.find(x => x.name == roleName);
                    if (!role) {
                        message.guild.createRole({
                            name: roleName
                        });
                    }
                    let lvlRole = message.guild.roles.find(x => x.name == roleName);
                    if (message.member.roles.has(lvlRole.id)) {
                        //do nothing
                    }
                    else {
                        message.channel.send("**Congrats!** You've received a new role!**");
                        addrankup.addRole(lvlRole.id).catch(console.error);
                    }

                }
            }//end of for loop
        }



    }

	/******************
	 * end of enmap xp
	 ******************/

    const args = message.content.slice(config.settings.prefix.length).split(' ');
    //const args = message.content.slice(config.settings.prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    //checks for the command within the collection
    //if (!client.commands.has(commandName)) return;
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    //const command = client.commands.get(commandName);	
    if (!command) return;

    //checks to make sure this isn't within a DM
    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('I can\'t execute that command inside DMs!');
    }
    //checks for command args
    if (command.args && !args.length) {
        let noID = config.emojis.no;
        let reply = `${noID} | You didn't provide any arguments, ${message.author}!`;
        if (command.usage) {

            reply += `\nThe proper usage would be: \`${command.usage}\``;
        }

        message.channel.send(reply);
    }

    //cooldown check
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            const hours = Math.floor(timeLeft / 3600);
            const time = timeLeft - hours * 3600;
            const minutes = Math.floor(time / 60);
            const seconds = time - minutes * 60;

            return message.reply(`please wait ${hours} hour(s), ${minutes} minute(s), and ${seconds.toFixed(0)} second(s) before reusing the \`${command.name}\` command.`);

            //return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

// Change it to config.token when you want to use this project for public usages.
//
// prv_config is only for personal usage or when youre forking this project,
// testing some functions with the and make a pull request to the repo.
// Warning: When you´re making a pull request, check that you didn´t wrote your token inside the config.json.
//
// To use prv_config, create a file called "private_config.json" inside the main directory.
// .gitignore will ignore this file when you want to commit and push.
// So nobody can get your bot token.
// Logging in Discord Bot at the API
client.login(config.token);


/**********
 * 
 * FUNCTIONS
 * 
 */

 /**
 * Set a greeting for the bot.
 *
 * @param greeting 
 * @since 0.0.1
 *
 * @public
 */
exports.setWelcome = function (/**String*/ greeting) {
    let oldGreet= config.settings.welcome;
    const settings = config.settings;

    console.log("\n>> Bot Change > Welcome Message set to: " + greeting);

    var fs = require('fs')
    fs.readFile('./config.json', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        var result = data.replace(settings.welcome, greeting);

        fs.writeFile('\config.json', result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
        console.log(chalk.greenBright(">> Successfully edited config.json. Followed values were changed in config.json:"));
        console.log(chalk.yellowBright(">> welcome: ") + chalk.redBright(oldGreet) + " -> " + chalk.greenBright.bold(greeting));
    });
};
/**End of greeting function */


/**
 * Set a greeting for the bot.
 *
 * @param leaving
 * @since 0.0.1
 *
 * @public
 */
exports.setGoodbye = function (/**String*/ leaving) {
    let oldGood= config.settings.welcome;
    const settings = config.settings;

    console.log("\n>> Bot Change > Goodbye Message set to: " + leaving);

    var fs = require('fs')
    fs.readFile('./config.json', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        var result = data.replace(settings.goodbye, leaving);

        fs.writeFile('\config.json', result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
        console.log(chalk.greenBright(">> Successfully edited config.json. Followed values were changed in config.json:"));
        console.log(chalk.yellowBright(">> goodbye: ") + chalk.redBright(oldGood) + " -> " + chalk.greenBright.bold(leaving));
    });
};
/**End of greeting function */


/**
 * Set a PREFIX for the bot.
 *
 * @param prefix - Prefix to be set for the bot.
 * @since 0.0.1
 *
 * @public
 */
exports.setPrefix = function (/**String*/ prefix) {
    let oldPrefix = config.settings.prefix;
    const settings = config.settings;

    console.log("\n>> Bot Change > Prefix set to: " + prefix);

    var fs = require('fs')
    fs.readFile('./config.json', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        var result = data.replace(settings.prefix, prefix);

        fs.writeFile('\config.json', result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
        console.log(chalk.greenBright(">> Successfully edited config.json. Followed values were changed in config.json:"));
        console.log(chalk.yellowBright(">> prefix: ") + chalk.redBright(oldPrefix) + " -> " + chalk.greenBright.bold(prefix));
    });
};
/**End of Prefix function */


/**
 * Set a game status for the bot.
 *
 * @param game - Game to be set for the bot.
 * @param maintenanceChange - Default: false. Set it to true when this function here is used for maintenance function
 * @param t0 - Number of milliseconds of the process is running. Use for that the function now() (npm module performance-now, added in 0.0.6.1)
 * @since 0.0.1
 *
 * @public
 */
exports.setGameStatus = function (/**String*/ game,/**boolean*/maintenanceChange,/**Number*/ t0) {

    // Short explanation why I´m using this boolean maintenanceChange
    // Currently we´re saving all data from the bot into the file botData.json
    // When I´m saving the new values which are sent by the maintenance function like the new game status
    // it will, without the boolean maintenanceChange, execute the fs.readFile function which produce
    // issues in the botData.json like some typos and other mistakes.
    // So this is the reason why I use this boolean.

    // When you want to publish your bot for real usage, you can use this file or creating a database
    // which you must implement here.

    // You have another idea how to store this values? Then make a Pull Request in GitHub! :)

    let gameBeforeChanging = client.user.localPresence.game.name;
    //client.user.setGame(game);
    client.user.setActivity(game, { type: 'PLAYING' })
        .then(presence => console.log(`Activity set to ${presence.game ? presence.game.name : 'none'}`))
        .catch(console.error);

    console.log("\n>> Bot Change > Game status set to: " + game);

    if (maintenanceChange === false) {

        fs.readFile("./botData.json", "utf-8", function (err, data) {
            if (err) throw err;
            let botData = JSON.parse(data);

            botData.bot_game = game;

            fs.writeFile('./botData.json', JSON.stringify(botData, null, 3), 'utf-8', function (err) {
                if (err) throw err;
                console.log(chalk.greenBright(">> Successfully edited botData.json. Followed values were changed in botData.json:"));
                console.log(chalk.yellowBright(">> game: ") + chalk.redBright(gameBeforeChanging) + " -> " + chalk.greenBright.bold(game));

                setTimeout(() => {
                    app.addLog({
                        "log_type": "info",
                        "log_message": "Successfully edited botData.json.",
                        "log_date": Date.now(),
                        "log_action": "Changed value: game"
                    });
                }, 50);

            })
        });

        let t1 = now();
        setTimeout(() => {
            app.addLog({
                "log_type": "info",
                "log_message": "Changed game status value",
                "log_date": Date.now(),
                "log_action": "function call took " + (t1 - t0).toFixed(3) + "ms"
            });
        }, 70);
        setTimeout(() => {
            app.addLog({
                "log_type": "success",
                "log_message": "Successfully changed game status of bot.",
                "log_date": Date.now(),
                "log_action": "Changed it from " + gameBeforeChanging + " to " + game + "."
            });
        }, 90);

    }
};

/**
 * Set a status for the bot (online | idle | dnd | invisible)
 *
 * @param status - Status of the bot.
 * @param maintenanceChange - Default: false. Set it to true when this function here is used for maintenance function
 * @see {@link https://discord.js.org/#/docs/main/stable/typedef/PresenceStatus|Discord.js Docs -> PresenceStatus}
 * @since 0.0.1
 *
 * @public
 */
exports.setBotStatus = function (/**String*/ status,/**boolean*/maintenanceChange) {

    // Store status in a let before the change
    let statusBeforeChanging = client.user.localPresence.status;

    if (status != "online" && status != "idle" && status != "invisible" && status != "dnd") {
        console.error("\n>> Bot Error: Invalid status to set! Use only the 4 vaild ones!" +
            "\n>> PresenceStatus: https://discord.js.org/#/docs/main/stable/typedef/PresenceStatus" +
            "\n>> Sent value: " + status);
    } else {


        if (maintenanceChange === false) {
            // Change value in botData.json
            fs.readFile('./botData.json', "utf-8", function (err, data) {
                if (err) throw err;
                let botData = JSON.parse(data);
                //console.log(botData)
                // Setting new status value
                botData.bot_status = status;
                //console.log(botData)
                // Writing new value into the json file
                fs.writeFile('./botData.json', JSON.stringify(botData, null, 3), 'utf-8', function (err) {
                    if (err) throw err;
                    // Setting the new value
                    client.user.setStatus(status);
                    // Output successful notification
                    console.log(">> Bot Change > Status set to: " + status);
                    console.log(chalk.greenBright(">> Successfully edited botData.json. Followed values were changed in botData.json:"));
                    console.log(chalk.yellowBright(">> status: ") + chalk.redBright(statusBeforeChanging) + " -> " + chalk.greenBright.bold(status));
                })
            });

        }

    }
};

/**
 * Writing a message to the administrators of a server. (testing)
 *
 * @param message - Message string which will be sent to the administrator.
 * @since 0.0.2-beta
 *
 * @public
 */
exports.sendAdminMessage = function (/**String*/ message) {
    let guilds = client.guilds;

    guilds.map(function (a) {
        a.owner.send(`You've received a message from the portal: \n\n`)
        a.owner.send(message);
        console.log(">> Bot Action > Server Admin DM sent to: " + a.owner.user.username + " - Server Admin of the server: " + a.name);
    });
};


/**
 * Returns the client object. Mainly for development.
 *
 * @since 0.0.1
 * @return {Object} The Client object.
 * @param t0 - Number of milliseconds of the process is running. Use for that the function now() (npm module performance-now, added in 0.0.6.1)
 * @public
 */
exports.sendClientObject = (/**Number*/t0) => {
    let t1 = now();
    app.addLog({
        "log_type": "info",
        "log_message": "Output the client object",
        "log_date": Date.now(),
        "log_action": "function call took " + (t1 - t0).toFixed(3) + "ms"
    });
    return client;
};

/**
 * Outputs the client.guilds object. Mainly for development.
 *
 * @since 0.0.3
 * @param t0 - Number of milliseconds of the process is running. Use for that the function now() (npm module performance-now, added in 0.0.6.1)
 * @public
 */
exports.sendGuildsObject = (/**Number*/t0) => {
    let guilds = client.guilds;
    // guilds.map(function (a) {
    //     console.log(a.name);
    // })
    let t1 = now();
    app.addLog({
        "log_type": "info",
        "log_message": "Output the guilds (client.guilds) object",
        "log_date": Date.now(),
        "log_action": "function call took " + (t1 - t0).toFixed(3) + "ms"
    });
    return guilds;
};

/**
 * Outputs the invites of servers where the bot is connected. For production and development.
 *
 * @since 0.0.3
 *
 * @public
 */
exports.sendInvitesOfServers = function () {
    let guilds = client.guilds;

    guilds.map(function (a) {
        a.fetchInvites().then((invites) => {
            invites.map(function (b) {
                if (b.maxAge === 0) {
                    console.log(b)
                }
            });
        });
    })
};

/**
 * Change status from bot to 'dnd' and writes a message to the discord server admins who are using this bot to
 * get informed about the maintenance (maintenance like for testing new functions etc.) [This function is in a Early status!]
 *
 * @param maintenanceBool - Maintenance status of the bot and the app.
 * @param t0 - Number of milliseconds of the process is running. Use for that the function now() (npm module performance-now, added in 0.0.6.1)
 * @since 0.0.4
 *
 * @public
 */
exports.maintenance = function (/**boolean*/ maintenanceBool, /**Number*/t0) {
    if (maintenanceBool === true) {
        // localPresence values before the maintenance starts
        this.sendAdminMessage("Hello dear server admin. I´m currently in maintenance mode. We will inform you when we finished our maintenance!");
        let statusBeforeChanging = client.user.localPresence.status;
        let gameBeforeChanging = client.user.localPresence.game.name;

        // Set new values to the bot user
        client.user.setPresence({ game: { name: 'Monkeys are working' }, status: 'dnd' })
            .then(console.log)
            .catch(console.error);

        logger.log({
            level: 'info',
            message: 'Server admins got an message which contains information that maintenance was enabled!',
            action: ''
        });

        logger.log({
            level: 'info',
            message: 'Values of bot client changed!',
            action: 'Changed values: client.user.localPresence.status , client.user.localPresence.game.name'
        });


        logger.log({
            level: 'info',
            message: 'Values in botData.json changed!',
            action: 'Changed property values: maintenance, status, bot_game'
        });


        let t1 = now();
        logger.log({
            level: 'maintenance',
            message: 'Maintenance was enabled!',
            action: 'Enabling maintenance took ' + (t1 - t0).toFixed(3) + 'ms'
        });

        console.log("\n>> Bot > Maintenance are now " + chalk.redBright.bold("enabled!"));
        console.log(">> Bot > Notification Message was sent to server admins.");

        console.log(chalk.greenBright(">> Successfully edited botData.json. Followed values were changed in botData.json:"));
        console.log(chalk.yellowBright(">> maintenance: ") + chalk.redBright("false") + " -> " + chalk.greenBright.bold("true"));
        console.log(chalk.yellowBright(">> status: ") + chalk.redBright(statusBeforeChanging) + " -> " + chalk.greenBright.bold("dnd"));
        console.log(chalk.yellowBright(">> bot_game: ") + chalk.redBright(gameBeforeChanging) + " -> " + chalk.greenBright.bold("Monkeys are working!"));

        // Reading the file and replace property values to new ones
        setTimeout(function () { startMaintenance(); }, 1000);


    } else {
        // localPresence values before the maintenance ends
        this.sendAdminMessage("Hello dear server admin. I´m officially out of maintenance mode. Cheers!");
        let statusBeforeChanging = client.user.localPresence.status;
        let gameBeforeChanging = client.user.localPresence.game.name;

        // Set new values to the bot user
        client.user.setPresence({ game: { name: 'Monkeys are finished!' }, status: 'online' })
            .then(console.log)
            .catch(console.error);

        logger.log({
            level: 'info',
            message: 'Server admins got an message which contains information that maintenance was enabled!',
            action: ''
        });

        logger.log({
            level: 'info',
            message: 'Values of bot client changed!',
            action: 'Changed values: client.user.localPresence.status , client.user.localPresence.game.name'
        });


        logger.log({
            level: 'info',
            message: 'Values in botData.json changed!',
            action: 'Changed property values: maintenance, status, bot_game'
        });

        let t1 = now();
        logger.log({
            level: 'maintenance',
            message: 'Maintenance was disabled!',
            action: 'Disabling maintenance took ' + (t1 - t0).toFixed(3) + 'ms'
        });

        // Output the notification
        console.log("\n>> Bot > Maintenance are now " + chalk.greenBright.bold("disabled!"));
        console.log(chalk.greenBright(">> Successfully edited botData.json. Followed values were changed in botData.json:"));
        console.log(chalk.yellowBright(">> maintenance: ") + chalk.redBright("true") + " -> " + chalk.greenBright.bold("false"));
        console.log(chalk.yellowBright(">> status: ") + chalk.redBright(statusBeforeChanging) + " -> " + chalk.greenBright.bold("online"));
        console.log(chalk.yellowBright(">> bot_game: ") + chalk.redBright(gameBeforeChanging) + " -> " + chalk.greenBright.bold("Monkeys are finished!"));
        // Reading the file and replace property values to new ones   

        setTimeout(function () { stopMaintenance(); }, 1000);
    }
};

function startMaintenance() {
    var fs = require('fs');
    fs.readFile('./botData.json', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }

        data = data.replace(botconfig.maintenance, true);
        data = data.replace(botconfig.bot_game, 'Monkeys are working');
        data = data.replace(botconfig.bot_status, 'dnd');

        fs.writeFile('./botData.json', data, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
}

function stopMaintenance() {
    var fs = require('fs');
    fs.readFile('./botData.json', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }

        data = data.replace(botconfig.maintenance, false);
        data = data.replace(botconfig.bot_game, 'Monkeys are finished!');
        data = data.replace(botconfig.bot_status, 'online');

        fs.writeFile('./botData.json', data, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
}