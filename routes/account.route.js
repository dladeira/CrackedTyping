const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: './public/data/avatars', limits: { fileSize: 5 * 1000000}})
const { User } = require('../models/index.js')
const loggedIn = require('../middlewares/loggedIn.js')
const config = require('config')
const fs = require('fs')

router.use(loggedIn)

router.get('/', (req, res) => {
    res.render('account.ejs', { user: req.user, ownAccount: true, averageWPM: "Also broken" })
})

router.get('/settings', (req, res) => {
    res.render('accountSettings.ejs', { user: req.user })
})

router.post('/updateAccount', upload.single('avatar'), (req, res) => {
    setAvatar(req.file, req.user._id, () => {
        setUsername(req.body.username, req.user._id, () => {
            setDescription(req.body.description, req.user._id, () => {
                res.redirect('/account')
            })
        })
    })
})

router.post('/delete', (req, res) => {
    User.deleteOne({ _id: req.user._id }, err => {
        if (err) {
            console.log(err)
            return res.send('An error has occured, please try again later')
        }
        req.logout()
        return res.redirect('/')
    })
})

function setAvatar(newAvatar, userId, callback) {
    if (!newAvatar) {
        return callback()
    }

    if (!newAvatar.mimetype.match(config.get("account.constraints.avatarType"))) {
        console.log(`User ${req.user.username} attempting to bruteforce a invalid file (${newAvatar.mimetype})`)
        return res.send('Invalid image')
    }

    User.findOne({ _id: userId}, (err, user) => {
        if (err) {
            console.log(err)
            return res.send('An error has occured, please try again later')
        }

        // Delete old avatar
        if (user.avatar != config.get('account.defaults.avatar')) {
            fs.unlink('public/' + user.avatar, err => {
                if (err) {
                    console.log(err)
                }
            })
        }

        user.avatar = newAvatar.path.replace('public', '')
        user.save().then(callback).catch(err => {
            console.log(err)
            return res.send('An error has occured, please try again later')
        })
    })
}

function setUsername(newUsername, userId, callback) {
    if (!newUsername.match(config.get('account.constraints.username'))) {
        console.log(`User ${req.user.username} attempting to bruteforce a invalid username (${newUsername})`)
        return res.send('Invalid username')
    }

    User.findOne({ _id: userId }, (err, user) => {
        if (err) {
            console.log(err)
            return res.send('An error has occured, please try again later')
        }
        User.findOne({ username: newUsername }, (err, usernameExists) => {
            if (err) {
                console.log(err)
                return res.send('An error has occured, please try again later')
            }

            if (usernameExists && (user.username != newUsername)) {
                console.log(`User ${req.user.username} attempted to bruteforce a duplicate username (${newUsername})`)
                return res.send("Username exists")
            }

            user.username = newUsername
            user.save().then(callback).catch(err => {
                console.log(err)
                return res.send('An error has occured, please try again later')
            })
        })
    })
}

function setDescription(newDescription, userId, callback) {
    if (!newDescription.match(config.get('account.constraints.description'))) {
        console.log(`User ${req.user.username} attempted to bruteforce a invalid description (${newDescription})`)
        return res.send('Invalid description')
    }

    User.findOne({ _id: userId }, (err, user) => {
        if (err) {
            console.log(err)
            return res.send('An error has occured, please try again later')
        }
        user.description = newDescription
        user.save().then(callback).catch(err => {
            console.log(err)
            return res.send('An error has occured, please try again later')
        })
    })
}

module.exports = router