const Game = require('./game.js');
var gameList = [];

function createGame(options, id) {
    if (!id) id =Math.floor(Math.random() * 10000); // Random number from 0 to 9999
    var newGame = new Game(id, options, () => {
        gameList.splice(findGameById(id), 1);
    });
    gameList.push(newGame);
    return newGame;
}

function findGameById(id) {
    for (var i = 0; i < gameList.length; i++) {
        if (gameList[i].id == id) return gameList[i];
    }
    return undefined;
}

function findGames() {
    return gameList;
}

function findUnstartedGame() {
    for (var i = 0; i < gameList.length; i++) {
        if (gameList[i].timeSinceStart < -1000) return gameList[i];
    }
    return undefined;
}

exports.findGameById = findGameById;
exports.findUnstartedGame = findUnstartedGame;
exports.createGame = createGame;
exports.findGames = findGames;