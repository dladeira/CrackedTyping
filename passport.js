const passport = require('passport')
const config = require('config')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const GithubStrategy = require('passport-github').Strategy
const { User}  = require('./models/index.js')

passport.use(new GoogleStrategy({
    clientID: config.get("app.google.clientId"),
    clientSecret: config.get("app.google.clientSecret"),
    callbackURL: config.get("app.origin") + "/auth/google/redirect",
    passReqToCallback: true
}, strategyCallback("googleId")))

passport.use(new GithubStrategy({
    clientID: config.get("app.github.clientId"),
    clientSecret: config.get('app.github.clientSecret'),
    callbackURL: config.get("app.origin") + "/auth/github/redirect", // The only acceptable value for app.origin is ladeira.eu
    passReqToCallback: true
}, strategyCallback("githubId")))

function strategyCallback(idProperty) {
    return function strategyCallback(req, accessToken, refreshToken, profile, done) {
        var query = {}
        query[idProperty] = profile.id
        if (req.user) {
            req.session.loginRedirect = "/account"
            User.findOne({ _id: req.user._id }, (err, user) => {
                User.findOne(query, (err, strategyExists) => {
                    if (err) {
                        console.log(err)
                        done(null)
                        return
                    }
                    if (strategyExists) {
                        done(null)
                        return
                    }
                    user[idProperty] = profile.id
                    user.save().then(user => {
                        return done(err, user)
                    })
                })
            })
        } else {
            req.session.loginRedirect = "/"
            var query = {}
            query[idProperty] = profile.id
            User.findOrCreate(query, (err, user, created) => {
                if (created) {
                    user.username = profile.displayName
                    user.save().then(user => {
                        return done(err, user)
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