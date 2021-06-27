const io = require('socket.io')()
const sharedSession = require('express-socket.io-session')
const session = require('../session.js')
const gameCoordinator = require('../gameCoordinator.js')
const config = require('config')

io.use(sharedSession(session, { autoSave: true }))

io.on('connection', socket => {
    
    console.log(`User ${socket.handshake.session.username} has connected`)
    socket.on('disconnect', () => {
    })

    socket.on('findGame', () => {
        gameCoordinator.findUnstartedGame(game => {
            game.addPlayer({
                username: socket.handshake.session.username,
                wpm: 0,
                saveData: socket.handshake.session.loggedIn
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
            game.setPlayerWPM(data.username, data.wpm)
            socket.emit('dataResponse', game.players)
        }
    })

    setInterval(() => {
        io.emit('dataRequest')
    }, config.get('game.dataCollectionDelay'))
})

module.exports = io