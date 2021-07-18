const io = require('socket.io')()
const config = require('config')
const sharedSession = require('express-socket.io-session')
const session = require('../session.js')
const gameCoordinator = require('../gameCoordinator.js')
const { User } = require('../models/index.js')

io.use(sharedSession(session, { autoSave: true }))

io.on('connection', socket => {

    socket.on('usernameExists', data => {
        User.findOne({ username: data.target }, (err, user) => {
            socket.emit('usernameExists', { username: data.target, exists: (data.currentUsername != data.target && (err || user)) })
        })
    })

    // Duplicate users is handled by gameCoordinator
    socket.on('findGame', () => {
        gameCoordinator.findUnstartedGame(game => {
            User.findOne({username: socket.handshake.session.username}, (err, user) => {
                if (err) {
                    return console.log(err)
                }
                if (user) {
                    game.addPlayer({
                        username: user.username,
                        avatar: user.avatar,
                        wpm: 0,
                        saveData: true,
                        final: false
                    })
                } else {
                    game.addPlayer({
                        username: socket.handshake.session.username,
                        avatar: config.get('account.defaults.avatar'),
                        wpm: 0,
                        saveData: false,
                        final: false,
                    })
                }
                socket.emit('foundGame', game)
            })
        })
    })

    /*
    - Every Xms ask for every socket's data (dataRequest)
    - Verify the data to prevent cheating
    - Update games based on user's data
    - Send relevant game data back to sockets (dataResponse)
    */

    socket.on('dataResponse', data => {
        var game = gameCoordinator.findGameById(data.gameId);
        if (game && (game.uniqueId == data.gameUniqueId)) {
            if (game.started) {
                game.setPlayerWPM(data.username, data.wpm, data.final)
            }
            socket.emit('dataResponse', { players: game.players, time: game.timeSinceStart })
        }
    })

    setInterval(() => {
        io.emit('dataRequest')
    }, config.get('game.dataCollectionDelay'))
})

module.exports = io