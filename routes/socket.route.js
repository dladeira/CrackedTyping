const io = require('socket.io')()
const sharedSession = require('express-socket.io-session')
const session = require('../session.js')
const gameCoordinator = require('../gameCoordinator.js')

io.use(sharedSession(session, { autoSave: true }))

io.on('connection', socket => {
    console.log(`User ${socket.handshake.session.username} has connected`)
    socket.on('disconnect', () => {

    })

    socket.on('gameUpdate', data => {
        io.emit('gameUpdate', data)
    })

    socket.on('gameJoin', data => {
        io.emit('gameJoin', data)
        gameCoordinator.findGameById(data.id).addUser(socket.handshake.session.username)
    })
})

module.exports = io