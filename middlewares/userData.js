/*
 Data is passed both to session and locals
 so it can be accessed both by socket.route.js
 and EJS files correspondingly
*/
function provideUserData(req, res, next) {
    // Don't create a new guest name if player already has one
    if (!req.session.guestName)
        req.session.guestName = `Guest ${Math.floor(Math.random() * 10000)}`

    // Used in socketIO
    req.session.username = req.user ? req.user.username : req.session.guestName
    req.session.loggedIn = req.user ? true : false

    res.locals.loggedIn = req.session.loggedIn
    res.locals.username = req.session.username
    res.locals.description = "This is a guest account" // Description gets override if logged in

    res.cookie('newGame', escape('Alt+n'), { sameSite: 'strict', secure: true, secure: true })
    res.cookie('mainMenu', escape('Alt+m'), { sameSite: 'strict', secure: true, secure: true })
    res.cookie('loggedIn', req.user != null, { sameSite: 'strict', secure: true, secure: true })

    if (req.user) { // Logged in
        res.locals.loggedInGoogle = (req.user.googleId != undefined)
        res.locals.loggedInGithub = (req.user.githubId != undefined)
        res.locals.description = req.user.description
        res.locals.admin = req.user.admin
        res.locals.avatar = req.user.avatar

        req.session._id = req.user._id // Used in socketIO

        if (req.user.keybinds) { // Override default keybinds with custom keybinds
            for (var keybind in req.user.keybinds) {
                res.cookie(keybind, escape(req.user.keybinds[keybind]))
            }
        }
    }
    next()
}

module.exports = provideUserData