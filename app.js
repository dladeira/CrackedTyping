const express = require('express')
const config = require('config')
const app = express()
const gameCoordinator = require('./gameCoordinator.js')

app.use(express.json())
app.use(require('./session.js'));
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.use(require('cookie-parser')())

app.get('/', (req, res) => {
    if (!req.session.username) {
        req.session.username = "Guest " + Math.floor(Math.random() * 10000)
    }
    res.render('landing.ejs', { username: req.session.username })
});

app.get('/game', (req, res) => {
    var game = gameCoordinator.findUnstartedGame()
    if (!game)
        var game = gameCoordinator.createGame(config.get("app.defaultGameOptions"))
    res.render("game.ejs", { game: game, username: req.session.username })
});

module.exports = app;