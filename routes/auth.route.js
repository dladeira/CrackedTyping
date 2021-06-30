const express = require('express')
const router = express.Router()
const config = require('config')
const passport = require('../passport.js')
const { User } = require('../models/index.js')
const loggedIn = require('../middlewares/loggedIn.js')

router.get("/:strategy/login", (req, res) => {
    passport.authenticate(req.params.strategy, {
        scope: [
            "profile",
            "email"
        ]
    })(req, res)
})

router.get("/:strategy/redirect", (req, res) => {
    passport.authenticate(req.params.strategy, {
        successRedirect: req.session.loginRedirect,
        failureRedirect: "/"
    })(req, res)
})

router.get("/:strategy/unlink", (req, res) => {
    var strategyIdVarName = req.params.strategy + "Id"
    var userStrategyId = req.user[strategyIdVarName]
    if (!userStrategyId) {
        console.log(`User ${req.user.username} attempting to unlink a not linked strategy (${req.params.strategy})`)
        res.redirect("/account")
        return
    }
    var query = {}
    query[strategyIdVarName] = userStrategyId
    User.findOne(query, (err, user) => {
        if (err) {
            console.log(err)
            res.send(err)
            return
        }
        user[strategyIdVarName] = undefined
        user.save()
        res.redirect("/account")
    })
})

router.get("/logout", loggedIn, (req, res) => {
    req.logout()
    res.redirect('/')
})

module.exports = router