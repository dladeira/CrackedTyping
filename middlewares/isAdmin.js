function isAdmin(req, res, next) {
    if (req.user.admin) {
        return next()
    }
    res.redirect('/')
}

module.exports = isAdmin