const express = require('express')
const router = express.Router()
const { User } = require('../models/index.js')
const loggedIn = require('../middlewares/loggedIn.js')
const config = require('config')

router.get('/', loggedIn, (req, res) => {
    res.render('profile.ejs', { pastGames: req.user.pastGames } )
})

router.post("/changeUsername", loggedIn, (req, res) => {
    var newUsername = req.body.newUsername
    if (!newUsername.match(config.get("app.regex.username"))) {
        console.log(`User ${req.user.username} attempting to bruteforce a invalid username (${newUsername})`)
        res.send("Invalid username")
        return
    }

    User.findOne({ _id: req.user._id }, (err, user) => {
        if (err) {
            console.log(err)
            res.send(err)
            return
        }
        User.findOne({ username: newUsername }, (err, usernameExists) => {
            if (err) {
                console.log(err)
                res.send(err)
                return
            }
            if (usernameExists) {
                console.log(`User ${req.user.username} attempting to bruteforce a duplicate username (${newUsername})`)
                res.send("Username exists")
                return
            }
            user.username = newUsername
            user.save().then(err => {
                res.redirect('/account')
            })
        })
    })
})

router.post("/changeDescription", loggedIn, (req, res) => {
    var newDescription = req.body.newDescription
    if (!newDescription.match(config.get("app.regex.description"))) {
        console.log(`User ${req.user.username} attempting to bruteforce a duplicate description (${newDescription})`)
        res.send("Invalid description")
        return
    }

    User.findOne({ _id: req.user._id }, (err, user) => {
        if (err) return res.send(err)
        user.description = newDescription
        user.save().then(err => {
            res.redirect('/account')
        })

    })
})

router.post("/delete", loggedIn, (req, res) => {
    User.deleteOne({ _id: req.user._id}, (err) => {
        if (err) {
            console.log(err)
            res.send(err)
            return
        }
        req.logout()
        res.redirect('/')
    })
})

module.exports = router