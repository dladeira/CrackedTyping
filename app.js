const express = require('express')
const config = require('config')
const app = express()
const gameCoordinator = require('./gameCoordinator.js')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/user.model.js')

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

app.use(express.json())
app.use(require('./session.js'));
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.use(require('cookie-parser')())

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    if (!req.session.username) {
        req.session.username = "Guest " + Math.floor(Math.random() * 10000)
    }
    if (req.user) {
        res.render('landing.ejs', { username: req.user.username, loggedIn: true })
    } else {
        res.render('landing.ejs', { username: req.session.username, loggedIn: false })
    }
});

app.get('/game', (req, res) => {
    var game = gameCoordinator.findUnstartedGame()
    if (!game)
        var game = gameCoordinator.createGame(config.get("app.defaultGameOptions"))
    res.render("game.ejs", { game: game, username: req.session.username })
});

app.get('/auth/google', passport.authenticate("google", {
    scope: [
        "profile",
        "email"
    ]
}))

app.get("/auth/google/redirect", passport.authenticate("google", { failureRedirect: "/"}), (req, res) => {
    res.redirect('/');
});

app.get("/auth/logout", (req, res) => {
    req.logout();
    res.redirect('/')
});

module.exports = app;