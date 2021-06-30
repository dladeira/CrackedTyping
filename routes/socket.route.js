const io = require('socket.io')()
const config = require('config')
const sharedSession = require('express-socket.io-session')
const session = require('../session.js')
const gameCoordinator = require('../gameCoordinator.js')
const { User } = require('../models/index.js')

io.use(sharedSession(session, { autoSave: true }))

io.on('connection', socket => {

    socket.on('usernameExists', username => {
        User.findOne({ username: username }, (err, user) => {
            socket.emit('usernameExists', { username: username, exists: (err || user) })
        })
    })

    // Duplicate users is handled by gameCoordinator
    socket.on('findGame', () => {
        gameCoordinator.findUnstartedGame(game => {
            game.addPlayer({
                username: socket.handshake.session.username,
                wpm: 0,
                saveData: socket.handshake.session.loggedIn,
                final: false
            })
            socket.emit('foundGame', game)
        })
    })

    /*
    - Every 100ms ask for every socket's data
    - Verify the data to prevent cheating
    - Update games based on user's data
    - Send relevant game data back to sockets
    */
    socket.on('dataResponse', data => {
        var game = gameCoordinator.findGameById(data.gameId);
        if (game && (game.uniqueId == data.gameUniqueId)) {
            if (game.started) {
                game.setPlayerWPM(data.username, data.wpm, data.final)
            }
            socket.emit('dataResponse', game.players)
        }
    })

    setInterval(() => {
        io.emit('dataRequest')
    }, config.get('game.dataCollectionDelay'))
})

module.exports = io