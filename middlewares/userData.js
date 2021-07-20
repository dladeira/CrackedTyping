/*
 Data is passed both to session and locals
 so it can be accessed both by socket.route.js
 and EJS files correspondingly
*/
function provideUserData(req, res, next) {
    // Don't create a new guest name if player already has one
    if (!req.session.guestName)
        req.session.guestName = `Guest ${Math.floor(Math.random() * 10000)}`

    req.session.username = req.user ? req.user.username : req.session.guestName
    req.session.loggedIn = req.user ? true : false

    res.locals.username = req.session.username
    res.locals.description = "This is a guest account" // Description gets override if logged in
    res.locals.loggedIn = req.session.loggedIn

    if (req.user) { // Logged in
        res.locals.loggedInGoogle = (req.user.googleId != undefined)
        res.locals.loggedInGithub = (req.user.githubId != undefined)
        res.locals.description = req.user.description
        req.session._id = req.user._id;
    }
    next()
}

module.exports = provideUserData