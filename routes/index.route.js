const express = require('express')
const router = express.Router()
const loggedIn = require('../middlewares/loggedIn.js')
const { User, Text, Game } = require('../models/index.js')

router.get('/', (req, res) => {
    res.render('landing.ejs')
})

router.get('/game', (req, res) => {
    res.render('game.ejs')
})

router.get('/infinite', (req, res) => {
    res.render('infinite.ejs')
})

router.get('/stats', (req, res) => {
    User.find({}, (err, users) => {
        Text.find({}, (err, texts) => {
            Game.find({}, (err, games) => {
                var textsWritten = 0 // Multiple texts can be written per game (more than 1 player)
                var averageWPM = 0
                for (var game of games) {
                    for (var playerObject of game.players) {
                        textsWritten++
                        averageWPM+=playerObject.wpm
                    }
                    for (var guestObject of game.guests) {
                        textsWritten++
                        averageWPM+=guestObject.wpm
                    }
                }
                averageWPM /= textsWritten
                averageWPM = isNaN(averageWPM) ? 0 : Math.round(averageWPM) // 0 divided by 0

                var wordsTyped = 0
                var lettersTyped = 0
                for (var text of texts) {
                    wordsTyped += text.passage.split(' ').length * text.timesTyped
                    lettersTyped += text.passage.split('').length * text.timesTyped
                }

                res.render('statistics.ejs', {
                    textCount: texts.length,
                    averageWPM: averageWPM,
                    userCount: users.length,
                    gamesPlayed: games.length,
                    wordsTyped: wordsTyped,
                    lettersTyped: lettersTyped
                })
            })
        })
    })
})

router.get('/keybinds', loggedIn, (req, res) => {
    res.render('keybinds.ejs')
})

router.post('/keybinds', loggedIn, (req, res) => {
    req.user.keybinds.newGame = req.body.newGame;
    req.user.keybinds.mainMenu = req.body.mainMenu;
    req.user.markModified('keybinds')
    req.user.save().then(() => {
        res.redirect('/')
    }).catch((err) => {
        console.log(err)
        res.send('An error has occured, please try again later')
    })
    
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
        var ownAccount = false;
        if (req.user) {
            ownAccount = req.params.username == req.user.username
        }
        
        // User exists, render their profile page
        return res.render('account.ejs', { user: user, ownAccount: ownAccount })
    })
})

module.exports = router;