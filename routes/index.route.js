const express = require('express')
const router = express.Router()
const { User } = require('../models/index.js')

router.get('/', (req, res) => {
    res.render('landing.ejs')
})

router.get('/game', (req, res) => {
    res.render('game.ejs')
})

/*
    Route works, just has no use as of now

    <form action="/userQuery" method="POST">
        <input name="query" placeholder="search for user" type="text">
        <button type="submit">/()</button>
    </form>
*/
router.post('/userQuery/', (req, res) => {
    // Search is case-insensitive
    User.find({ username: new RegExp(req.body.query, 'i') }, (err, users) => {
        if (err) {
            console.log(err)
            return res.send(err)
        }
        res.render('searchUser.ejs', { users: users })
    })
})

router.get('/user/:username', (req, res) => {
    // Username is case-insensitive
    User.findOne({ username: new RegExp(`^${req.params.username}$`, 'i') }, (err, user) => {
        if (err) {
            console.log(err)
            return res.send(err)
        }

        if (!user) // User does not exist, send error message
            return res.send(`User ${req.params.username} cannot be found`)

        // User exists, render their profile page
        return res.render('profile.ejs', { user: user })
    })
})

module.exports = router;