const express = require('express')
const app = express()
const passport = require('./passport.js')
const cookieParser = require('cookie-parser')
const userData = require('./middlewares/userData.js')
const { indexRouter, authRouter, accountRouter, controlRouter, contributeRouter } = require('./routes/index.js')

// Parse data from POST requests
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static content
app.use(express.static(__dirname + '/public'))

// MongoDB session store
app.use(require('./session.js'))
app.use(cookieParser())

// Authentication
app.use(passport.initialize())
app.use(passport.session())

// Pass userData to EJS
app.use(userData)

// Trust proxies in a production enviroment
app.set('trust proxy', app.get('env') == 'production')

// Routes
app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/account', accountRouter)
app.use('/control', controlRouter)
app.use('/contribute', contributeRouter)

module.exports = app