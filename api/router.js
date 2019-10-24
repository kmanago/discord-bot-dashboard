const bodyParser = require('body-parser');
module.exports = (app) => {
    app.use('/', require('./routes/index'));
    //app.use('/dashboard', require('./routes/dashboard'));
    app.use('/profile', require('./routes/profile'));

    
    app.use('/messages', require('./routes/messages'));
    app.use('/log', require('./routes/log'));
    app.use('/manage', require('./routes/manage'));
   

    //function routes/
    app.use('/outputClient', require('./routes/functions/outputclient'));
    app.use('/outputGuilds', require('./routes/functions/outputguilds'));

    app.use('/change-game-status', require('./routes/functions/changegamestatus'));
    app.use('/change-status', require('./routes/functions/changestatus'));

    app.use('/activateMaintenance', require('./routes/functions/activateMaintenance'));
    app.use('/deactivateMaintenance', require('./routes/functions/deactivateMaintenance'));

    app.use('/send-serveradmin-dm-message', require('./routes/functions/sendadmindm'));
}