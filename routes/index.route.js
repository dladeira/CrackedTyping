const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('landing.ejs')
});

router.get('/game', (req, res) => {
    res.render('game.ejs')
});

// TODO Mysterious logout at /profile...
router.get('/user/profile', (req, res) => {
    if (req.user) {
        res.render('profile.ejs', { pastGames: req.user.pastGames } )
    } else {
        res.redirect('/')
    }
})

module.exports = router;