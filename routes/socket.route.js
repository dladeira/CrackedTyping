const io = require('socket.io')()
const config = require('config')
const sharedSession = require('express-socket.io-session')
const session = require('../session.js')
const gameCoordinator = require('../gameCoordinator.js')
const { User } = require('../models/index.js')

var infinitePlayers = {}

io.use(sharedSession(session, { autoSave: true }))

setInterval(() => {
    io.emit('dataRequest')
}, config.get('game.dataCollectionDelay'))

/*
 TODO: Add infinite configuration section
*/

setInterval(() => {
    gameCoordinator.getRandomText((text) => {
        io.emit('infiniteText', ' ' + text.passage)
    })
}, 4000)

setInterval(() => {
    for (var player in infinitePlayers) {
        infinitePlayers[player].sinceLastUpdate+= 100
        if (infinitePlayers[player].sinceLastUpdate > 3000) {
            delete infinitePlayers[player]
        }
    }
}, 100)

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
                        final: false,
                        id: socket.handshake.session._id
                    })
                } else {
                    game.addPlayer({
                        username: socket.handshake.session.username,
                        avatar: config.get('account.defaults.avatar'),
                        wpm: 0,
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
        if (!game) return
        if (game.started) {
            game.setPlayerWPM(data.username, data.wpm, data.final)
        }
        socket.emit('dataResponse', { players: game.players, time: game.timeSinceStart })
    })

    socket.on('infiniteUpdate', (data) => {
        User.findOne({username: socket.handshake.session.username}, (err, user) => {
            if (err) {
                return console.log(err)
            }

            if (!infinitePlayers[data.username]) infinitePlayers[data.username] = {}
            infinitePlayers[data.username].sinceLastUpdate = 0
            infinitePlayers[data.username].wpm = data.wpm

            infinitePlayers[data.username].avatar = user ? user.avatar : config.get('account.defaults.avatar')

            socket.emit('infiniteUpdate', infinitePlayers)
        })
    })
})

module.exports = io