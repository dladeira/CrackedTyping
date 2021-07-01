const express = require('express')
const router = express.Router()
const { User } = require('../models/index.js')

router.get('/', (req, res) => {
    res.render('landing.ejs')
})

router.get('/game', (req, res) => {
    res.render('game.ejs')
})

router.get('/user/:username', (req, res) => {
    // Username is case-insensitive
    User.findOne({ username: new RegExp(`^${req.params.username}$`, 'i')}, (err, user) => {
        if (err) {
            console.log(err)
            res.send(err)
            return err
        }

        if (user) {
            res.render('profile.ejs', { user: user })
        } else {
            res.send(`User ${req.params.username} cannot be found`)
        }
    })
})

module.exports = router;