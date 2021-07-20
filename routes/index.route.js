const express = require('express')
const router = express.Router()
const { User, Text } = require('../models/index.js')

router.get('/', (req, res) => {
    res.render('landing.ejs')
})

router.get('/game', (req, res) => {
    res.render('game.ejs')
})

router.get('/stats', (req, res) => {
    User.find({}, (err, users) => {
        Text.find({}, (err, texts) => {
            var totalTimesTyped = 0;
            var totalWPM = 0;
            for (text of texts) {
                totalTimesTyped += text.timesTyped;
                totalWPM += text.totalWPM
            }
            var averageWPM = totalWPM / totalTimesTyped;
            averageWPM = (averageWPM == "Infinity") || isNaN(averageWPM) ? "0" : Math.round(averageWPM)

            var gamesPlayed = 0;
            var dates = []
            for (var user of users) {
                if (!user.pastGames) continue
                for (var game of user.pastGames) {
                    if (!dates.includes(game.date)) {
                        gamesPlayed+=1
                        dates.push(game.date)
                    }
                }
            }
    
            res.render('statistics.ejs', {
                totalTimesTyped: totalTimesTyped,
                totalWPM: totalWPM,
                averageWPM: averageWPM,
                userCount: users.length,
                gamesPlayed: gamesPlayed
            })
        })
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