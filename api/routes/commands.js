const router = require('express').Router();


router.get("/", (req, res, next) => {
    var client = req.app.get('client');
    var maintenanceStatus = req.app.get('maintenanceStatus');
    var member = req.app.get('member');
    var Discord = req.app.get('Discord'); 
    var server = req.app.get('server');
    var adminRole = req.app.get('adminRole');
    var modRole = req.app.get('modRole');
    const perms = Discord.EvaluatedPermissions;

    res.render("commands", {data: client, maintenanceStatus: maintenanceStatus, member: member, perms: perms,
        server: server, adminRole: adminRole, modRole:modRole });
});
module.exports = router;
