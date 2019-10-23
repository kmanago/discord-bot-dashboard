const router = require('express').Router();

router.post("/", (req, res, next) => {
 
    var bot= req.app.get('bot');
    var botData= req.app.get('botData');
    var maintenanceStatus = req.app.get('maintenanceStatus');

     // Using the exports function from the required "./main" module to set the game
     bot.setBotStatus(req.body.status, maintenanceStatus);

     // TODO: Updating the config.json with the new bot_game value to get the new game value when restarting the bot.

     var fs = require('fs')
     fs.readFile('./botData.json', 'utf8', function (err,data) {
         if (err) {
             return console.log(err);
         }
         var result = data.replace(botData.bot_status, req.body.status);

         fs.writeFile('./botData.json', result, 'utf8', function (err) {
             if (err) return console.log(err);
         });
     });
    
     console.log("\n>> Redirecting to /");
     res.redirect('back');

});
module.exports = router;
