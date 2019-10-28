const router = require('express').Router();


router.get("/", (req, res, next) => {
    var client = req.app.get('client');
    var maintenanceStatus = req.app.get('maintenanceStatus');
    var member = req.app.get('member');
    var Discord = req.app.get('Discord'); 
   
    const perms = Discord.EvaluatedPermissions;

    res.render("commands", {data: client, maintenanceStatus: maintenanceStatus, member: member, perms: perms });
});
module.exports = router;
