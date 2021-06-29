const express = require('express')
const router = express.Router()
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

module.exports = router