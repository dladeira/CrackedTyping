const express = require('express')
const router = express.Router()
const isAdmin = require('../middlewares/isAdmin.js')
const { User, Text, Script, Contribution } = require('../models/index.js')

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

router.get('/texts', (req, res) => {
    Text.find({}, (err, texts) => {
        if (err) {
            console.log(err)
            return res.send('An error has occured, please try again later')
        }

        res.render('control-texts.ejs', { texts: texts })
    })
})

router.post('/texts', (req, res) => {
    for (var text in req.body) {
        if (text.includes('deletePassage'))
            continue
        Text.findOne({ _id: text}, (err, mongoText) => {
            if (err) {
                console.log(err)
                return res.send('An error has occured, please try again later')
            }

            if (mongoText) {
                if (req.body[mongoText._id + '-deletePassage']) {
                    Text.deleteOne({ _id: mongoText._id}, (err) => {
                        if (err)
                            console.log(err)
                    })
                } else {
                    mongoText.passage = req.body[mongoText._id]
                    mongoText.save()
                }
            }
        })
    }
    res.redirect('/control')
})

router.post('/texts/new', (req, res) => {
    new Text({
        passage: req.body.passage
    }).save(() => {
        res.redirect('/control')
    })
})

router.get('/scripts', (req, res) => {
    Script.find({}, (err, scripts) => {
        if (err) {
            console.log(err)
            return res.send('An error has occured, please try again later')
        }

        res.render('control-scripts.ejs', { scripts: scripts })
    })
})

router.post('/scripts', (req, res) => {
    for (var script in req.body) {
        if (script.includes('deletePassage'))
            continue
        Script.findOne({ _id: script}, (err, mongoScript) => {
            if (err) {
                console.log(err)
                return res.send('An error has occured, please try again later')
            }

            if (mongoScript) {
                if (req.body[mongoScript._id + '-deletePassage']) {
                    Script.deleteOne({ _id: mongoScript._id}, (err) => {
                        if (err)
                            console.log(err)
                    })
                } else {
                    mongoScript.passage = req.body[mongoScript._id]
                    mongoScript.save()
                }
            }
        })
    }
    res.redirect('/control')
})

router.post('/scripts/new', (req, res) => {
    new Script({
        passage: req.body.passage
    }).save(() => {
        res.redirect('/control')
    })
})

router.get('/contributions', (req, res) => {
    Contribution.find({}, (err, contributions) => {
        if (err) {
            console.log(err)
            return res.send('An error has occured, please try again')
        }
        res.render('control-contribution.ejs', { contributions: contributions.filter(contribution => contribution.status == 0)})
    })
})

router.post('/contributions/accept', (req, res) => {
    Contribution.findOne({ _id: req.body.id }, (err, contribution) => {
        if (err) {
            console.log(err)
            return res.send('An error has occured, please try again later')
        }

        if (!contribution) {
            console.log('Contribution not found')
            return res.send('An error has occured, please try again later')
        }

        switch (contribution.contributionType) {
            case 0:
                new Text({
                    passage: contribution.contributionValue
                }).save().then(() => {
                    contribution.status = 1
                    contribution.save().then(() => {
                        return res.redirect('/control/contributions')
                    })
                })
                break
            case 1:
                new Script({
                    passage: contribution.contributionValue
                }).save().then(() => {
                    contribution.status = 1
                    contribution.save().then(() => {
                        return res.redirect('/control/contributions')
                    })
                })
        }
    })
})

router.post('/contributions/reject', (req, res) => {
    Contribution.findOne({ _id: req.body.id }, (err, contribution) => {
        if (err) {
            console.log(err)
            return res.send('An error has occured, please try again later')
        }

        if (!contribution) {
            console.log('Contribution not found')
            return res.send('An error has occured, please try again later')
        }

        contribution.status = 2
        contribution.save().then(() => {
            return res.redirect('/control/contributions')
        })
    })
})

module.exports = router