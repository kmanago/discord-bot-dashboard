const router = require('express').Router();
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

router.post("/", (req, res, next) => {
    /*var client = req.app.get('client');
    var maintenanceStatus = req.app.get('maintenanceStatus');
    var botData = req.app.get('botData');*/
    var bot = req.app.get('bot');
    //var member = req.app.get('member');
    
    bot.sendAdminMessage(req.body.message);

    res.redirect("/messages");
    console.log("\n>> Redirecting to /messages");

    //res.render("messages", {data: client, maintenanceStatus: maintenanceStatus, botData: botData, member: member});
});
module.exports = router;
