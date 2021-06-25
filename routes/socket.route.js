const io = require('socket.io')()
const sharedSession = require('express-socket.io-session')
const session = require('../session.js')
const gameCoordinator = require('../gameCoordinator.js')
var socketGameMap = {};

io.use(sharedSession(session, { autoSave: true }));

io.on('connection', socket => {
    socket.on('disconnect', () => {

    })
    socket.on('joinGame', gameId => {
        if (!socketGameMap[socket.id]) socketGameMap[socket.id] = [];
        socketGameMap[socket.id].push(gameId);
        gameCoordinator.findGameById(gameId).addUser(socket.handshake.session.username);
    });
});

module.exports = io;