const express = require('express')
const router = express.Router()
const passport = require('../passport.js')

router.get('/google', passport.authenticate("google", {
    scope: [
        "profile",
        "email"
    ]
}))

router.get("/google/redirect", passport.authenticate("google", { failureRedirect: "/"}), (req, res) => {
    res.redirect('/')
})

router.get("/logout", (req, res) => {
    req.logout()
    res.redirect('/')
})

module.exports = router