const express = require('express')
const router = express.Router()
const config = require('config')
const gameCoordinator = require('../gameCoordinator.js')

router.get('/', (req, res) => {
    res.render('landing.ejs',)
});

router.get('/game', (req, res) => {
    res.render('game.ejs')
});

module.exports = router;