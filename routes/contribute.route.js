const express = require('express')
const router = express.Router()
const loggedIn = require('../middlewares/loggedIn.js')
const { Contribution } = require('../models/index.js')

router.use(loggedIn)

router.get('/', (req, res) => {
    res.render('contribute.ejs')
})

router.get('/submissions', (req, res) => {
    Contribution.find({ contributionAuthor: req.user._id}, (err, contributions) => {
        if (err) {
            console.log(err)
            return res.send('An error has occured, please try again later')
        }

        res.render('contribute-submissions.ejs', {contributions: contributions})
    })
})

router.get('/text', (req, res) => {
    res.render('contribute-text.ejs')
})

router.post('/text', (req, res) => {
    const contribution = new Contribution({
        contributionType: 0,
        contributionValue: req.body.value,
        contributionAuthor: req.user._id
    })

    contribution.save((err) => {
        if (err) {
            console.log(err)
            return res.send('An error has occured, please try again later')
        }
        return res.redirect('/contribute')
    })
})

router.get('/script', (req, res) => {
    res.render('contribute-script.ejs')
})

router.post('/script', (req, res) => {
    const contribution = new Contribution({
        contributionType: 1,
        contributionValue: req.body.value,
        contributionAuthor: req.user._id
    })

    contribution.save((err) => {
        if (err) {
            console.log(err)
            return res.send('An error has occured, please try again later')
        }
        return res.redirect('/contribute')
    })
})

module.exports = router