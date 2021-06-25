const { Text } = require('./models/index.js')
const config = require('config')

var gameList = []

function createGame(options, callback, id) { // Leave id argument for future games with random ids
    if (!id) id = findUnusedId()

    getRandomText(text => {
        var newGame = new Game(id, options, text, () => {
            gameList.splice(findGameById(id), 1)
        })
        gameList.push(newGame)
        callback(newGame)
    })
}

function findGameById(id) {
    for (var i = 0; i < gameList.length; i++) {
        if (gameList[i].id == id) return gameList[i]
    }
    return undefined
}

function findUnusedId() {
    for (var i = 1; i < 9999; i++) {
        if (!findGameById(i)) {
            return i
        }
    }
    console.log('FATAL ERROR: Ran out of ids! Using random number from 1 to 1 million and praying it hasn\'t been used before')
    return Math.floor(Math.random() * 1000000)
}

function findGames() {
    return gameList
}

function findUnstartedGame(callback) {
    for (var i = 0; i < gameList.length; i++) {
        if (gameList[i].timeSinceStart < -1000) callback(gameList[i])
        return
    }
    createGame(config.get('game.defaultOptions'), callback)
}

function getRandomText(callback) {
    Text.find({}, (err, texts) => {
        if (err) {
            console.log('Encountered an error while getting all texts, using game.defaultText')
            callback(config.get('game.defaultText'))
            return
        }
        callback(texts[parseInt(Math.random() * texts.length)])
    })
}

exports.findGameById = findGameById
exports.findUnstartedGame = findUnstartedGame
exports.createGame = createGame
exports.findGames = findGames

class Game {
    constructor(id, options, text, gameEndCallback) {
        this.options = options
        this.id = id
        this.gameEndCallback = gameEndCallback
        this.text = text // TODO: Rename text to passage in views

        setTimeout(() => {
            this.startGame()
        }, this.options.startDelay)

        // Set startTime ahead of time
        this.startTime = new Date().getTime() + this.options.startDelay

        this.users = []
    }

    startGame() {
        console.log(`Game ${this.id} started with ${this.users.length} players`)
        setTimeout(() => {
            this.endGame()
        }, this.options.gameLength)
    }

    endGame() {
        this.text.totalTimesTyped += this.playerCount
            this.text.save()
        setTimeout(() => { // Don't delete game instantly
            this.gameEndCallback()
        }, this.deleteDelay)
    }

    get timeSinceStart() {
        return new Date().getTime() - this.startTime
    }

    get length() {
        return this.options.gameLength
    }

    get gameOngoing() {
        return (timeSinceStart > 0) && (length > timeSinceStart)
    }

    get playerCount() {
        return this.users.length;
    }

    // No removing users (no leaving game)
    addUser(user) {
        this.users.push(user)
    }
}