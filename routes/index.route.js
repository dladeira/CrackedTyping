const express = require('express')
const router = express.Router()
const loggedIn = require('../middlewares/loggedIn.js')

router.get('/', (req, res) => {
    res.render('landing.ejs')
})

router.get('/game', (req, res) => {
    res.render('game.ejs')
})

// TODO Mysterious logout at /profile...
router.get('/user/profile', loggedIn, (req, res) => {
    if (req.user) {
        res.render('profile.ejs', { pastGames: req.user.pastGames } )
    } else {
        res.redirect('/')
    }
})

module.exports = router;