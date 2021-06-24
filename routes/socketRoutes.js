const io = require('socket.io')()
const sharedSession = require('express-socket.io-session')
const session = require('../session.js')
const gameCoordinator = require('../gameCoordinator.js')
var socketGameMap = {};

io.use(sharedSession(session, { autoSave: true }));

io.on('connection', socket => {
    console.log(`Socket ${socket.id} : ${socket.handshake.session.username} has connected`)
    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} has disconnected`)
    })
    socket.on('joinGame', gameId => {
        console.log(`Socket ${socket.handshake.session.username} has joined the game ${gameId}`)
        if (!socketGameMap[socket.id]) socketGameMap[socket.id] = [];
        socketGameMap[socket.id].push(gameId);
        gameCoordinator.findGameById(gameId).addUser(socket.handshake.session.username);
    });
});

module.exports = io;