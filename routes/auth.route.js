const express = require('express')
const router = express.Router()
const config = require('config')
const passport = require('../passport.js')
const { User } = require('../models/index.js')
const loggedIn = require('../middlewares/loggedIn.js')

router.get('/:strategy/login', strategyExists, (req, res) => {
    passport.authenticate(req.params.strategy, {
        scope: [
            'profile',
            'email'
        ]
    })(req, res)
})

router.get('/:strategy/redirect', strategyExists, (req, res) => {
    passport.authenticate(req.params.strategy, {})(req, res, err => {
        if (err) {
            console.log(err)
            return res.redirect('/')
        }
        return res.redirect(req.session.loginRedirect)
    })
})

router.get('/:strategy/unlink', strategyExists, (req, res) => {
    var stratergyProperty = req.params.strategy + 'Id'
    if (!req.user[stratergyProperty]) {
        console.log(`User ${req.user.username} attempting to unlink a not linked strategy (${req.params.strategy})`)
        return res.redirect('/account/settings')
    }

    User.findOne({ [stratergyProperty]: req.user[stratergyProperty] }, (err, user) => {
        if (err)
            return res.send('An error has occured, please try again later')

        user[stratergyProperty] = undefined
        user.save().then(() => {
            return res.redirect("/account/settings")
        }).catch(err => {
            console.log(err)
            return res.send('An error has occured, please try again later')
        })
    })
})

router.get("/logout", loggedIn, (req, res) => {
    req.logout()
    return res.redirect('/')
})

function strategyExists(req, res, next) {
    if (req.params.strategy) { // Strategy parameter exists (need to verify that it's a valid strategy)
        for (var strategy in config.get('auth')) {
            if (req.params.strategy == strategy)
                return next()
        }
        return res.send('Invalid login strategy')
    } else { // Strategy parameter does not exist (no need to verify)
        return next()
    }
}

module.exports = router