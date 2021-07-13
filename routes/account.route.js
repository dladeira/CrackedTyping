const express = require('express')
const router = express.Router()
const { User } = require('../models/index.js')
const loggedIn = require('../middlewares/loggedIn.js')
const config = require('config')

router.use(loggedIn)

router.get('/', (req, res) => {
    res.render('account.ejs', { user: req.user, ownAccount: true })
})

router.get('/settings', (req, res) => {
    res.render('accountSettings.ejs', { user: req.user })
})

router.post('/updateAccount', (req, res) => {
    var newUsername = req.body.username
    if (!newUsername.match(config.get('account.constraints.username'))) {
        console.log(`User ${req.user.username} attempting to bruteforce a invalid username (${newUsername})`)
        return res.send('Invalid username')
    }

    User.findOne({ _id: req.user._id }, (err, user) => {
        if (err) {
            console.log(err)
            return res.send(err)
        }
        User.findOne({ username: newUsername }, (err, usernameExists) => {
            if (err) {
                console.log(err)
                return res.send(err)
            }

            if (usernameExists && (user.username != newUsername)) {
                console.log(`User ${req.user.username} attempted to bruteforce a duplicate username (${newUsername})`)
                return res.send("Username exists")
            }

            user.username = newUsername
            user.save().then(() => {
                var newDescription = req.body.description
                if (!newDescription.match(config.get('account.constraints.description'))) {
                    console.log(`User ${req.user.username} attempted to bruteforce a invalid description (${newDescription})`)
                    return res.send('Invalid description')
                }

                User.findOne({ _id: req.user._id }, (err, user) => {
                    if (err) {
                        console.log(err)
                        return res.send(err)
                    }
                    user.description = newDescription
                    user.save().then(() => {
                        res.redirect('/account/settings')
                    }).catch(err => {
                        console.log(err)
                        return res.send('An error has occured, please try again later')
                    })

                })
            }).catch(err => {
                console.log(err)
                return res.send('An error has occured, please try again later')
            })
        })
    })
})

router.post('/delete', (req, res) => {
    User.deleteOne({ _id: req.user._id }, err => {
        if (err) {
            console.log(err)
            return res.send(err)
        }
        req.logout()
        return res.redirect('/')
    })
})

module.exports = router