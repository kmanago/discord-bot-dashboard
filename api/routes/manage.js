const router = require('express').Router();


router.get("/", (req, res, next) => {
    var client = req.app.get('client');
    var maintenanceStatus = req.app.get('maintenanceStatus');
    var botData = req.app.get('botData');
    var member = req.app.get('member');
    var log = req.app.get('log');
    var prefix = req.app.get('prefix');
    var welcome = req.app.get('welcome');
    var goodbye = req.app.get('goodbye');
    var commands = req.app.get('commands');
    var server = req.app.get('server');
    var adminRole = req.app.get('adminRole');
    var modRole = req.app.get('modRole');

    res.render("manage", {
        data: client, maintenanceStatus: maintenanceStatus, botData: botData, member: member,
         commands: commands, prefix: prefix, log: log, welcome: welcome, server: server,
         goodbye: goodbye, adminRole: adminRole, modRole:modRole
    });
});
module.exports = router;
