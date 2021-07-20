const MongoStore = require('connect-mongo')
const config = require('config')

const session = require('express-session')({
    secret: 'secretSessionMessageOrSomething',
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 4
    },
    store: MongoStore.create({
        mongoUrl: config.get('mongodb.connectionString'),
        mongoOptions: config.get('mongodb.options')
    })
})

module.exports = session