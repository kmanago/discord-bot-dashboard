const router = require('express').Router();
const Discord = require('discord.js');

router.get("/", (req, res, next) => {
    var client = req.app.get('client');
    var maintenanceStatus = req.app.get('maintenanceStatus');
    var botData = req.app.get('botData');
    var member = req.app.get('member');
    var server = req.app.get('server');
    var adminRole = req.app.get('adminRole');
    var modRole = req.app.get('modRole');

    res.render("dashboard", {data: client, maintenanceStatus: maintenanceStatus, botData: botData, member: member,
        server: server, adminRole: adminRole, modRole:modRole});
});
module.exports = router;
