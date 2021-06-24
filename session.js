const MongoStore = require('connect-mongo');
const session = require('express-session')({
    secret: 'secretSessionMessageOrSomething',
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: 'mongodb://defaultUser:passwordPassport1224@ladeira.eu:1283/CrackedTyping',
        mongoOptions: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    })
});

module.exports = session;