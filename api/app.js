const config = require("./../config.json");
const botData = require("./../botData.json");
const express = require('express');
const session = require('express-session');
const bot = require("./../main.js");
const log = require("../logs/logs.json");
const fs = require("fs");
const bodyParser = require('body-parser');
const now = require("performance-now");
const Discord = require('discord.js');

var passport = require('passport');
const Strategy = require("passport-discord").Strategy;
//var Strategy = require('../lib').Strategy;
const helmet = require("helmet");
const url = require("url");

const chalk = require('chalk');
const ctx = new chalk.constructor({level: 3});

const app = express();

var exports = module.exports = {};

/**
 * Required for starting the web server and to load the express app.
 * Version shows the current version of this project, not of the bot.
 *
 * Last updates: {@link https://goo.gl/yDFywF Commits from master branch}
 *
 * Check out and contribute to the project {@link https://goo.gl/DVJQem on GitHub}.
 *
 * @param client - Discord.js Client Object
 * @version 0.0.6.3
 * @public
 */
exports.startApp = function (/**Object*/ client) {

    let port = config.port;
    
    passport.serializeUser(function(user, done) {
        done(null, user);
      });
      passport.deserializeUser(function(obj, done) {
        done(null, obj);
      });
      
      
      var scopes = ['identify', 'guilds'];
      
      passport.use(new Strategy({
          clientID: config.clientID,
          clientSecret: config.clientsecret,
          callbackURL: 'http://localhost:3000/callback',
          scope: scopes
      }, function(accessToken, refreshToken, profile, done) {
          process.nextTick(function() {
              return done(null, profile);
          });
      }));

   
    let maintenanceStatus = botData.maintenance;
    app.set('view engine', 'ejs');
    app.set('port', port);


    app.use('/lib', express.static('lib', { redirect : false }));
    app.use('/styles', express.static('src', { redirect : false }));
    app.use('/scripts', express.static('src', { redirect : false }));
    app.use('/src', express.static('src', { redirect : false }));

    app.set('client', client);
    app.set('botData', botData);
    app.set('bot', bot);

    let devID = '252638038650257429';
    let dev = client.users.get(devID);
    app.set('dev', dev);

    app.set('maintenanceStatus', maintenanceStatus);
    app.set('log', log);

    
    app.set('prefix', config.settings.prefix);
    let commands = client.commands;
    app.set('commands', commands);

    app.set('welcome', config.settings.welcome);
    app.set('goodbye', config.settings.goodbye);
    app.set('adminRole', config.settings.adminRole);
    app.set('modRole', config.settings.modRole);

    app.set('Discord', Discord);
    let server = client.guilds.find(val => val.id === '252638472269987840');
    app.set('server', server);

    app.use(session({
        secret: 'ssshhhhh',
        resave: false,
        saveUninitialized: false,
    }));

   

    
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(helmet());

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    require ('./router')(app);

    function checkAuth(req, res, next) {
        if (req.isAuthenticated()) return next();
        req.session.backURL = req.url;
        res.redirect("/login");
      }
     
    /** PAGE ACTIONS RELATED TO SESSIONS */

  // The login page saves the page the person was on in the session,
  // then throws the user to the Discord OAuth2 login page.
  app.get("/login", (req, res, next) => {
    if (req.session.backURL) {
      req.session.backURL = req.session.backURL;
    } else if (req.headers.referer) {
      const parsed = url.parse(req.headers.referer);
      if (parsed.hostname === app.locals.domain) {
        req.session.backURL = parsed.path;
      }
    } else {
      req.session.backURL = "/";
    }
    next();
  },
  passport.authenticate('discord', { scope: scopes }));
      
    

    // ---- GET  
    app.get('/callback',
    passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) {
          if (req.user.id === client.appInfo.owner.id) {
      req.session.isAdmin = true;
    } else {
      req.session.isAdmin = false;
    }
    if (req.session.backURL) {
      const url = req.session.backURL;
      req.session.backURL = null;
      res.redirect(url);
    } else {
      res.redirect("/");
    }
     app.set('member', req.user);
    console.log(req.user) } // auth success
     
);

app.get('/logout', function(req, res) {
    req.session.destroy(() => {
        req.logout();
        app.set('member', null)
        res.redirect("/"); //Inside a callback… bulletproof!
      });
});


/*
app.get('/dashboard', checkAuth, function(req, res) {
    var member = req.user;
    res.render('dashboard', {data: client, maintenanceStatus: maintenanceStatus, member: req.user });
});


app.get('/commands', function(req, res) {
    const perms = Discord.EvaluatedPermissions;
    res.render('commands', {data: client, maintenanceStatus: maintenanceStatus, member: req.user, perms: perms });
});*/

app.get('/roles', function(req, res) {

    res.render('commands', {data: client, maintenanceStatus: maintenanceStatus, member: req.user, perms: perms, server: server });
});

app.get('/profile',checkAuth, function(req, res){
    res.render("profile", {data: client, maintenanceStatus: maintenanceStatus, botData: botData, member: req.user,
        server: server, adminRole: adminRole, modRole:modRole});
    });

/*function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.send('not logged in :(');
}
*/
/*
    app.get("/manage", (req, res) => {
        res.render("manage", {
            data: client,
            maintenanceStatus: maintenanceStatus,
            log: log,
            commands: commands,
            botData: botData,
            prefix: config.settings.prefix,
            member: req.user
        })
    });
*/

    app.get("/status", (req, res) => {
        res.render("status", {data: client, maintenanceStatus: maintenanceStatus, member: req.user,
        botData: botData, dev: dev, commands: commands});
    });
    

    /* This GET route is for development usage only.
     * With this route, you can test new functions for your fork
     * when you want to make a pull request and want to check if this function you´ve made works.
     */
    app.get("/testingNewFunction", (req, res) => {

        // Here you´re writing the new function or calling a new function.
        bot.sendInvitesOfServers();

        res.redirect("/");
        console.log("\n>> Redirecting to /");
    });

    // ---- POST

    app.post("/change-prefix", (req, res) => {
       
        bot.setPrefix(req.body.newPrefix);
        console.log("\n>> Redirecting to manage");
        res.redirect('back');
    });

    app.post("/change-welcome", (req, res) => {
        bot.setWelcome(req.body.welcome);
        console.log("\n>> Redirecting to manage");
        res.redirect('back');
    });

    /*app.post("/change-game-status" ,(req, res) => {

        // Using the exports function from the required "./main" module to set the game
        bot.setGameStatus(req.body.gameStatus, false, now());

        // TODO: Updating the config.json with the new bot_game value to get the new game value when restarting the bot.
       // bot.setBotStatus(req.body.gameStatus, false);
        var fs = require('fs')
        fs.readFile('./botData.json', 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            var result = data.replace(botData.bot_game, req.body.gameStatus);

            fs.writeFile('./botData.json', result, 'utf8', function (err) {
                if (err) return console.log(err);
            });
        });
       
        //res.redirect("/");
        console.log("\n>> Redirecting to /");
        res.redirect('back');
    });*/
/*
    app.post("/change-status", (req, res) => {
        console.log(`Status changing too from webpage: ` +req.body.status)
       // var botStatus = botData.bot_status;
        bot.setBotStatus(req.body.status, maintenanceStatus);
        var fs = require('fs')
        fs.readFile('./botData.json', 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            var result = data.replace(botData.bot_status, req.body.status);

            fs.writeFile('./botData.json', result, 'utf8', function (err) {
                if (err) return console.log(err);
            });
        });

       // res.redirect(req.get('referer'));
        //res.redirect("/manage");
        console.log("\n>> Redirecting to manage");
        res.redirect('back');
    });

    app.post("/send-serveradmin-dm-message", (req, res) => {

        bot.sendAdminMessage(req.body.message);

        res.redirect("/messages");
        console.log("\n>> Redirecting to /messages");
    });
*/


    // ---- 404 Page
    app.use(function (req, res, next) {
        res.status(404).render("404");
    });

    // You may not heard about the package 'chalk'..
    // It is a package for coloring console output. Colors in outputs are important to give a output more attention when its needed.

    // You can look inside the repository of chalk to understand how it works and how to use it.
    // Repository: https://goo.gl/qfQ4Pv

    app.listen(config.port, function () {
        console.log(chalk.cyanBright('>> Dashboard is online and running on port ' + config.port + '!\n'));
    });

};



/**
 * This function sends a notification to the discord bot dashboard user
 * to get the information that a user sent a message to him.
 * This can be disabled in a future update.
 *
 * @todo Give the possibility to disable DM notifications.
 * @param user - Username from message.author which sent the DM
 * @param content - Content of the DM.
 * @param timestamp - Timestamp when the message was sent.
 * @since 0.0.5
 * @public
 * @deprecated
 */
exports.dmNotification = function (/**String*/user,/**String*/content,/**Integer*/timestamp) {
    console.log(chalk.yellowBright('>> Bot: You´ve got a DM by ' +  user + " with following content:"));
    console.log(chalk.yellow(content));

    let date = new Date(timestamp);
    let day = this.convertingGetDay(date.getDay());

    // To understand converting timestamps to a normal known date
    // look at this question in StackOverflow -> https://goo.gl/Lb2Nxa
    // MDN Documentation about Date -> https://goo.gl/rT25GW

    // Minutes part from the timestamp
    let minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    let seconds = "0" + date.getSeconds();

    console.log(chalk.greenBright('Message sent at ' + day + ", " + date.getMonth() +  "/" + date.getDate() + "/" + date.getFullYear() + ", " + date.getHours() + ':' + minutes.substr(-2) + ":" + seconds.substr(-2) + ' \n'));
};





/**
 * Converting the integer from Date.getDay() to a string which contains the day.
 *
 * @param getDay - Date.getDay integer
 * @since 0.0.5
 * @private
 */
exports.convertingGetDay = function (getDay) {
    let day;
    switch (getDay){
        case 0:
            day = "Sunday";
            break;
        case 1:
            day = "Monday";
            break;
        case 2:
            day = "Tuesday";
            break;
        case 3:
            day = "Wednesday";
            break;
        case 4:
            day = "Thursday";
            break;
        case 5:
            day = "Friday";
            break;
        case 6:
            day = "Saturday";
            break;
        default:
            day = "A problem occurred when trying to convert the Date.getDay() integer to a string \n";
    }
    return day;
};

/**
 * Adding data to log.
 *
 * @param logData - In logData, your giving an object which will be added to the log.
 * @since 0.0.6
 * @public
 */
exports.addLog = (/**Object*/logData) => {

    fs.readFile("./log.json", "utf-8" , (err, data) => {

        if (err) { throw err; }
        let log = JSON.parse(data);

        log.push(logData);
        fs.writeFile("./log.json", JSON.stringify(log, null, 3), (err) => {
            if(err) throw err;
        })
    })
};