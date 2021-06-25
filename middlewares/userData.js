function provideUsername(req, res, next) {
    if (!req.session.guestName) {
        req.session.guestName = "Guest " + Math.floor(Math.random() * 10000)
    }

    if (req.user) { // Logged in, provide actual username
        res.locals.username = req.user.username
        res.locals.loggedIn = true;
    } else { // Not logged in, provide guest username
        res.locals.username = req.session.guestName
        res.locals.loggedIn = false;
    }

    next();
}

module.exports = provideUsername;