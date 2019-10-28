const router = require('express').Router();
const now = require("performance-now");

router.post("/", (req, res) => {
 
    var bot= req.app.get('bot');
    var maintenanceStatus = req.app.get('maintenanceStatus');
    
     // Using the exports function from the required "./main" module to set the game
     bot.setGameStatus(req.body.gameStatus, maintenanceStatus, now());

     console.log("\n>> Redirecting to /");
     res.redirect('manage');

});
module.exports = router;
