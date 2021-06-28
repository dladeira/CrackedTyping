const express = require('express')
const router = express.Router()
const passport = require('../passport.js')

router.use(ensureLoggedOut)

router.get('/google', passport.authenticate("google", {
    scope: [
        "profile",
        "email"
    ]
}))

router.get("/google/redirect", passport.authenticate("google", { failureRedirect: "/"}), (req, res) => {
    res.redirect('/')
})

router.get('/github', passport.authenticate("github"))

router.get("/github/redirect", passport.authenticate("github", { failureRedirect: "/"}), (req, res) => {
    res.redirect('/')
})

router.get("/logout", (req, res) => {
    req.logout()
    res.redirect('/')
})

function ensureLoggedOut(req, res, next) {
    if (req.user)
        req.logout()
    next()
}

module.exports = router