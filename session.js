const MongoStore = require('connect-mongo')
const config = require('config')

const session = require('express-session')({
    secret: 'secretSessionMessageOrSomething',
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 4
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_STRING,
        mongoOptions: config.get('mongoOptions')
    })
})

module.exports = session