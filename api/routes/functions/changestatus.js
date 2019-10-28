const router = require('express').Router();

router.post("/", (req, res, next) => {
 
    var bot= req.app.get('bot');
    var maintenanceStatus = req.app.get('maintenanceStatus');

     // Using the exports function from the required "./main" module to set the game
     bot.setBotStatus(req.body.status, maintenanceStatus);
     console.log("\n>> Redirecting to /");
     res.redirect('back');

});
module.exports = router;
