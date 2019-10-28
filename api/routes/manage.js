const router = require('express').Router();


router.get("/", (req, res, next) => {
    var client = req.app.get('client');
    var maintenanceStatus = req.app.get('maintenanceStatus');
    var botData = req.app.get('botData');
    var member = req.app.get('member');
    var log = req.app.get('log');
    var prefix = req.app.get('prefix');
    var welcome = req.app.get('welcome');
    var commands = req.app.get('commands');
    var server = req.app.get('server');

    res.render("manage", {
        data: client, maintenanceStatus: maintenanceStatus, botData: botData, member: member,
         commands: commands, prefix: prefix, log: log, welcome: welcome, server: server
    });
});
module.exports = router;
