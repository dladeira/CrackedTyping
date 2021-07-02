const MongoStore = require('connect-mongo')
const config = require('config')

const session = require('express-session')({
    secret: 'secretSessionMessageOrSomething',
    resave: true,
    saveUninitialized: true,
    cookie: { sameSite: 'lax' },
    store: MongoStore.create({
        mongoUrl: config.get('mongodb.connectionString'),
        mongoOptions: config.get('mongodb.options')
    })
})

module.exports = session