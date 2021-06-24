const express = require('express')
const app = express()
const gameCoordinator = require('./gameCoordinator.js')
const cookieParser = require('cookie-parser')

const defaultGameOptions = {
    startIn: 5000,
    gameLength: 30000,
    gameDeleteDelay: 5000
}

app.use(require('./session.js'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.use(cookieParser())

app.get('/', (req, res) => {
    if (!req.session.username) req.session.username = "Guest " + Math.floor(Math.random() * 10000)
    res.render('landing.ejs', { username: req.session.username });
});

app.get('/game', (req, res) => {
    var game = gameCoordinator.findUnstartedGame()
    if (!game)
        var game = gameCoordinator.createGame(defaultGameOptions);
    res.render("game.ejs", { game: game, username: req.session.username })
});

module.exports = app;