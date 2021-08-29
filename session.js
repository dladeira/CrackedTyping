const MongoStore = require('connect-mongo')
const config = require('config')

const session = require('express-session')({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 4,
        secure: process.env.NODE_ENV == 'production'
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_STRING,
        mongoOptions: config.get('mongoOptions')
    })
})

module.exports = session