const express = require('express')
const router = express.Router()
const config = require('config')
const gameCoordinator = require('../gameCoordinator.js')

router.get('/', (req, res) => {
    if (!req.session.username) {
        req.session.username = "Guest " + Math.floor(Math.random() * 10000)
    }
    if (req.user) {
        res.render('landing.ejs', { loggedIn: true })
    } else {
        res.render('landing.ejs', { loggedIn: false })
    }
});

router.get('/game', (req, res) => {
    gameCoordinator.findUnstartedGame(game => {
        res.render('game.ejs', { game: game })
    })
});

module.exports = router;