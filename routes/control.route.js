const express = require('express')
const router = express.Router()
const isAdmin = require('../middlewares/isAdmin.js')
const { User, Text } = require('../models/index.js')

router.use(isAdmin)

router.get('/', (req, res) => {
    res.render('control.ejs')
})

router.get('/users', (req, res) => {
    User.find({}, (err, users) => {
        if (err) {
            console.log(err)
            return res.send('An error has occured, please try again later')
        }
        res.render('control-users.ejs', { users: users })
    })
})

router.post('/users', (req, res) => {
    for (var user in req.body) {
        User.findOne({ username: user}, (err, mongoUser) => {
            if (err) {
                console.log(err)
                return res.send('An error has occured, please try again later')
            }
            
            if (mongoUser) {
                mongoUser.admin = (req.body[mongoUser.username] == 1)
                mongoUser.save()
            }
        })
    }
    res.redirect('/control')
})

module.exports = router