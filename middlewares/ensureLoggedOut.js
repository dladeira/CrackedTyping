function ensureLoggedOut(req, res, next) {
    if (req.user)
        req.logout()
    next()
}

module.exports = ensureLoggedOut