const router = require('express').Router();

router.post("/", (req, res, next) => {
    var bot = req.app.get('bot');
    bot.sendAdminMessage(req.body.message);

    res.redirect("/messages");
    console.log("\n>> Redirecting to /messages");

});
module.exports = router;
