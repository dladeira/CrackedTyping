const express = require('express')
const app = express()
const passport = require('./passport.js')
const { indexRouter, authRouter, accountRouter } = require('./routes/index.js')
const userData = require('./middlewares/userData.js')
const cookieParser = require('cookie-parser')

// Parse data from POST requests
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static
app.use(express.static(__dirname + '/public'))

// MongoDB session store
app.use(require('./session.js'))
app.use(cookieParser())

// Google authentication
app.use(passport.initialize())
app.use(passport.session())

// Pass logged in status and username data to EJS
app.use(userData);

// Routes
app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/account', accountRouter)

module.exports = app