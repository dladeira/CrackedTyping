const MongoStore = require('connect-mongo');
const session = require('express-session')({
    secret: 'secretSessionMessageOrSomething',
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: 'mongodb://admin:mediameister5634@localhost:1283/CrackedTyping?authSource=admin',
        mongoOptions: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    })
});

module.exports = session;