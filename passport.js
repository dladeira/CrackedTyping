const passport = require('passport')
const config = require('config')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const GithubStrategy = require('passport-github').Strategy
const { User}  = require('./models/index.js')

passport.use(new GoogleStrategy({
    clientID: config.get("app.google.clientId"),
    clientSecret: config.get("app.google.clientSecret"),
    callbackURL: config.get("app.origin") + "/auth/google/redirect"
}, (accessToken, refreshToken, profile, done) => {
    User.findOrCreate({ googleId: profile.id }, (err, user, created) => {
        if (created) {
            user.username = profile.displayName;
            user.save()
        }
        return done(err, user)
    })
}))

passport.use(new GithubStrategy({
    clientID: "d4d413105f6aa015ffb3",
    clientSecret: "24628de04064459fd160e525d255f474c5c6390b",
    callbackURL: config.get("app.origin") + "/auth/github/redirect"
}, (accessToken, refreshToken, profile, done) => {
    User.findOrCreate({ githubId: profile.id }, (err, user, created) => {
        if (created) {
            user.username = profile.displayName;
            user.save()
        }
        return done(err, user)
    })
}))

passport.serializeUser((user, done) => {
    done(null, user.id)
})
passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user)
    })
})

module.exports = passport