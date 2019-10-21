module.exports = (app) => {
    app.use('/', require('./routes/index'));
    app.use('/dashboard', require('./routes/dashboard'));
    app.use('/profile', require('./routes/profile'));

    
    app.use('/messages', require('./routes/messages'));
    app.use('/log', require('./routes/log'));
    //app.use('/manage', require('./routes/manage'));


    //function routes/
    app.use('/outputClient', require('./routes/functions/outputclient'));
    app.use('/outputGuilds', require('./routes/functions/outputguilds'));

    
}