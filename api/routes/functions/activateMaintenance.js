const router = require('express').Router();
const now = require("performance-now");

router.get("/", (req, res) => {
    var client = req.app.get('client');
    var bot= req.app.get('bot');
    var maintenanceStatus = req.app.get('maintenanceStatus');
    var botData = req.app.get('botData');
    var member = req.app.get('member');
    var log = req.app.get('log');
    var prefix = req.app.get('prefix');
    var commands = req.app.get('commands');

    let t0 = now();
    bot.maintenance(true, t0);
    maintenanceStatus = true;
    res.set({'Refresh': '2; url=/manage'});
    res.render('activateMaintenance', {data: client, maintenanceStatus: maintenanceStatus, botData: botData, member: member,
        commands: commands, prefix:prefix, log: log}); 
});
module.exports = router;