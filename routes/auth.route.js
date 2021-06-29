const express = require('express')
const router = express.Router()
const config = require('config')
const passport = require('../passport.js')
const { User } = require('../models/index.js')

router.get('/google', passport.authenticate("google", {
    scope: [
        "profile",
        "email"
    ]
}))

router.get("/google/redirect", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
    res.redirect('/user/profile')
})

router.get('/google/unlink', (req, res) => {
    if (!req.user.googleId) {
        res.redirect('/')
        return
    }
    User.findOne({ googleId: req.user.googleId }, (err, user) => {
        if (user.githubId) {
            user.googleId = undefined
            user.save()
        }
        res.redirect('/user/profile')
    })
})

router.get('/github', passport.authenticate("github"))

router.get('/github/unlink', (req, res) => {
    if (!req.user.githubId) {
        res.redirect('/')
        return
    }
    User.findOne({ githubId: req.user.githubId }, (err, user) => {
        if (user.googleId) {
            user.githubId = undefined
            user.save()
        }
        res.redirect('/user/profile')
    })
})

router.get("/github/redirect", passport.authenticate("github", { failureRedirect: "/" }), (req, res) => {
    res.redirect('/user/profile')
})

router.get("/logout", (req, res) => {
    req.logout()
    res.redirect('/')
})

router.post("/usernameChange", (req, res) => {
    var newUsername = req.body.newUsername
    if (!newUsername.match(config.get("app.regex.username"))) {
        res.send("stop trying to hack in a invalid username")
        return
    }

    User.findOne({_id: req.user._id}, (err, user) => {
        User.findOne({ username: newUsername }, (err, usernameExistsUser) => {
            if (err || usernameExistsUser) {
                res.send("stop trying to hack in a invalid username")
                return
            }
            if (err) return res.send(err)
            user.username = newUsername
            user.save().then(err => {
                res.redirect('/user/profile')
            })
        })
    })
})

router.post("/descriptionChange", (req, res) => {
    var newDescription = req.body.newDescription
    if (!newDescription.match(config.get("app.regex.description"))) {
        res.send("stop trying to hack in a invalid description")
        return
    }
    
    User.findOne({_id: req.user._id}, (err, user) => {
        if (err) return res.send(err)
        user.description = newDescription
        user.save().then(err => {
            res.redirect('/user/profile')
        })

    })
})

module.exports = router