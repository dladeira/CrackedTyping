const passport = require('passport')
const config = require('config')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const GithubStrategy = require('passport-github').Strategy // Github Strategy only works on production
const { User }  = require('./models/index.js')

passport.use(new GoogleStrategy(getStrategyOptions('google'), getStrategyCallback('googleId')))
passport.use(new GithubStrategy(getStrategyOptions('github'), getStrategyCallback('githubId')))

function getStrategyOptions(strategy) {
    return {
        clientID: config.get(`auth.${strategy}.clientId`),
        clientSecret: config.get(`auth.${strategy}.clientSecret`),
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
                    user.username = profile.displayName
                    user.save().then(user => {
                        return done(err, user)
                    }).catch(err => {
                        return done(err)
                    })
                } else {
                    return done(err, user)
                }
            })
        }
    }
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