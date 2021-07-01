function provideUserData(req, res, next) {
    if (!req.session.guestName) {
        req.session.guestName = "Guest " + Math.floor(Math.random() * 10000)
    }

    if (req.user) { // Logged in, provide actual username
        req.session.username = req.user.username
        req.session.loggedIn = true

        res.locals.username = req.user.username
        res.locals.loggedIn = true
        res.locals.loggedInGoogle = (req.user.googleId != undefined)
        res.locals.loggedInGithub = (req.user.githubId != undefined)
        res.locals.description = req.user.description
    } else { // Not logged in, provide guest username
        req.session.username = req.session.guestName
        req.session.loggedIn = false

        res.locals.username = req.session.guestName
        res.locals.loggedIn = false
    }

    next()
}

module.exports = provideUserData