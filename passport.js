const passport = require('passport')
const config = require('config')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const GithubStrategy = require('passport-github').Strategy // Github Strategy only works on production
const { User }  = require('./models/index.js')

passport.use(new GoogleStrategy(getStrategyOptions('google'), getStrategyCallback('googleId')))

if (app.get('env') == 'production') {
    passport.use(new GithubStrategy(getStrategyOptions('github'), getStrategyCallback('githubId')))
}

function getStrategyOptions(strategy) {
    return {
        clientID: process.env[`${strategy.toUpperCase()}_ID`],
        clientSecret: process.env[`${strategy.toUpperCase()}_SECRET`],
        callbackURL: config.get('app.origin') + `/auth/${strategy}/redirect`,
        passReqToCallback: true
    }
}

function getStrategyCallback(strategyProperty) {
    return function strategyCallback(req, accessToken, refreshToken, profile, done) {
        req.session.loginRedirect = req.user ? '/account/settings' : '/'
        if (req.user) { // User is logged in, link the new strategy
            User.findOne({ _id: req.user._id }, (err, user) => {
                if (err)
                    return done(err)
                
                // Check if stratergy already exists
                User.findOne({ [strategyProperty]: profile.id }, (err, strategyExists) => {
                    if (strategyExists)
                        return done(null, false, { message: 'There is already an account with this login' })
                    
                    user[strategyProperty] = profile.id
                    user.save().then(user => {
                        return done(err, user)
                    }).catch(err => {
                        return done(err)
                    })
                })
            })
        } else { // User is not logged in, create/login account
            User.findOrCreate({ [strategyProperty]: profile.id }, (err, user, created) => {
                if (err)
                    return done(err)
                if (created) {
                    getUnusedUsername((username) => {
                        user.username = username
                        console.log(username)
                        user.description = config.get("account.defaults.description")
                        user.save().then(user => {
                            return done(err, user)
                        }).catch(err => {
                            return done(err)
                        })
                    })
                } else {
                    return done(err, user)
                }
            })
        }
    }
}

function getUnusedUsername(callback) {
    var username = `User${Math.floor(Math.random() * 100000000)}`
    User.findOne({username: username}, (err, user) => {
        if (err) {
            console.log(err)
            return
        }

        if (user) // User with username exists
            getUnusedUsername((username) => {
                callback(username)
            })
        callback(username)
    })
}

passport.serializeUser((user, done) => {
    done(null, user.id)
})
passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user)
    })
})

module.exports = passport