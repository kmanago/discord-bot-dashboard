module.exports = (app) => {
    app.use('/', require('./routes/index'));
    app.use('/dashboard', require('./routes/index'));
    app.use('/profile', require('./routes/profile'));

    
    app.use('/messages', require('./routes/messages'));
    app.use('/log', require('./routes/log'));


    //function routes/
    app.use('/outputClient', require('./routes/functions/outputclient'));
    app.use('/outputGuilds', require('./routes/functions/outputguilds'));

    
}