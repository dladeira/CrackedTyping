function povideUserData(req, res, next) {
    if (!req.session.guestName) {
        req.session.guestName = "Guest " + Math.floor(Math.random() * 10000)
    }

    if (req.user) { // Logged in, provide actual username
        req.session.username = req.user.username
        res.locals.username = req.user.username
        req.session.loggedIn = true
        res.locals.loggedIn = true
    } else { // Not logged in, provide guest username
        req.session.username = req.session.guestName
        res.locals.username = req.session.guestName
        req.session.loggedIn = false
        res.locals.loggedIn = false
    }

    next()
}

module.exports = povideUserData