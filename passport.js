const passport = require('passport')
const config = require('config')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
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
        return done(err, user);
    });
}));
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});

module.exports = passport;