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
    var server = req.app.get('server');
    var adminRole = req.app.get('adminRole');
    var modRole = req.app.get('modRole');

    let t0 = now();
    bot.maintenance(false, t0);
    maintenanceStatus = false;
    res.set({'Refresh': '2; url=/manage'});
    res.render('deactivateMaintenance', {data: client, maintenanceStatus: maintenanceStatus, botData: botData, member: member,
        commands: commands, prefix:prefix, log: log, server: server, adminRole: adminRole, modRole:modRole}); 
});
module.exports = router;