const router = require('express').Router();
const now = require("performance-now");

router.get("/", (req, res, next) => {
   
    var bot= req.app.get('bot');
    let t0 = now();
    console.log(bot.sendClientObject(t0));
    res.redirect("/manage");

});
module.exports = router;
