const express = require('express')
const router = express.Router()
const loggedIn = require('../middlewares/loggedIn.js')

router.get('/', (req, res) => {
    res.render('landing.ejs')
})

router.get('/game', (req, res) => {
    res.render('game.ejs')
})

module.exports = router;