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
    for (var game of gameList) {
        if (game.id == id)
            return game
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
    for (var game of gameList) {
        if (game.timeSinceStart < -1000) {
            callback(game)
            return
        }
    }
    createGame(config.get('game.defaultOptions'), callback)
}

function getRandomText(callback) {
    Text.find({}, (err, texts) => {
        if (err) {
            console.log('Encountered an error while getting all texts, using game.defaultText')
            return callback(config.get('game.defaultText'))
        }
        callback(texts[parseInt(Math.random() * texts.length)])
    })
}

exports.findGameById = findGameById
exports.findUnstartedGame = findUnstartedGame
exports.findGames = findGames

class Game {
    constructor(id, options, text, gameEndCallback) {
        this.uniqueId = Math.random() * 1000000000 // Game uniqueness check (game ids get recycled)
        this.options = options
        this.id = id
        this.gameEndCallback = gameEndCallback
        this.text = text
        this.startTime = new Date().getTime() + this.options.startDelay
        this.deleteDelay = this.options.deleteDelay

        setTimeout(() => {
            this.startGame()
        }, this.options.startDelay)

        // Set startTime ahead of time
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
        this.text.timesTyped += this.playerCount
        this.text.totalWPM += this.totalWPM
        this.text.save() // Error handling overrated, doesn't really matter anyways
        for (var player of this.players) {
            if (player.saveData && player.final) {
                User.findOne({ username: player.username}, (err, user) => {
                    if (err)
                        return console.log(err)
                    user.pastGames.push({
                        wpm: player.wpm,
                        date: new Date().getTime()
                    })
                    user.save().catch(err => { // Now this matters a bit more
                        console.log(err)
                    })
                })
            }
        }
        setTimeout(() => { // Don't delete game instantly (slow internet connections might finish later)
            this.gameEndCallback() // Sri Lanka internet connection lmao
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

    get totalWPM() {
        var wpm = 0
        for (var player of this.players) {
            wpm+=player.wpm
        }
        return wpm
    }

    playerJoined(username) {
        for (var player of this.players) {
            if (player.username == username)
                return true
        }
        return false
    }

    // No removing users (play game or gay)
    addPlayer(user) {
        if (!this.playerJoined(user.username))
            this.players.push(user)
    }

    playerFinished(username) {
        for (var player of this.players) {
            if (player.username == username)
                return player.final
        }
        // Player doesn't exist, lets just say he finished cause like why not
        return true
    }

    setPlayerWPM(username, wpm, final) {
        for (var player of this.players) {
            if (player.username == username) {
                if (!this.playerFinished(username)) {
                    player.wpm = wpm
                    player.final = final
                }
            }
        }
    }
}