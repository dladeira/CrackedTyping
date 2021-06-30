const { Text, User } = require('./models/index.js')
const config = require('config')

var gameList = []

function createGame(options, callback) {
    id = findUnusedId()

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
        if (gameList[i].timeSinceStart < -1000) {
            callback(gameList[i])
            return
        }
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
exports.findGames = findGames

class Game {
    constructor(id, options, text, gameEndCallback) {
        this.uniqueId = Math.random() * 1000000000; // Game uniqueness check (game ids get reused)
        this.options = options
        this.id = id
        this.gameEndCallback = gameEndCallback
        this.text = text

        setTimeout(() => {
            this.startGame()
        }, this.options.startDelay)

        // Set startTime ahead of time
        this.startTime = new Date().getTime() + this.options.startDelay

        this.players = []
    }

    startGame() {
        console.log(`Game ${this.id} started with ${this.players.length} players`)
        setTimeout(() => {
            this.endGame()
        }, this.options.gameLength)
    }

    endGame() {
        console.log(`Game ${this.id} ended`)
        this.text.totalTimesTyped += this.playerCount
        this.text.save()
        for (var player of this.players) {
            if (player.saveData && player.final) {
                User.findOne({ username: player.username}, (err, user) => {
                    if (err) {
                        console.log(err)
                        return;
                    }
                    user.pastGames.push({ wpm: player.wpm, date: new Date().getTime() });
                    user.save()
                })
            }
        }
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

    get ongoing() {
        return (this.timeSinceStart > 0) && (this.length > this.timeSinceStart)
    }
    
    get started() {
        return (this.timeSinceStart > 0)
    }
    get playerCount() {
        return this.players.length
    }

    get passage() {
        return this.text.passage
    }

    playerJoined(username) {
        for (var user of this.players) {
            if (user.username == username) {
                return true
            }
        }
        return false
    }

    // No removing users (no leaving game)
    addPlayer(user) {
        if (!this.playerJoined(user.username))
            this.players.push(user)
    }

    playerFinished(username) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].username == username) {
                return this.players[i].final
            }
        }
        return true
    }

    setPlayerWPM(username, wpm, final) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].username == username) {
                if (!this.playerFinished(username)) {
                    this.players[i].wpm = wpm
                    this.players[i].final = final
                }
            }
        }
    }
}