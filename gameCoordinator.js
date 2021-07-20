const mongoose = require('mongoose')
const { Text, User, Game } = require('./models/index.js')
const config = require('config')

var ongoingGames = []

function createGame(options, callback) {
    findUnusedId().then(id => {
        getRandomText(text => {
            var newGame = new GameClass(id, options, text, () => {
                ongoingGames.splice(findGameById(id), 1)
            })
            ongoingGames.push(newGame)
            callback(newGame)
        })
    })
}

function findGameById(id) {
    for (var game of ongoingGames) {
        if (game.id == id)
            return game
    }
    return undefined
}

async function findUnusedId() {
    for (var i = 1; i < 999999999; i++) { // 1 billion possible games
        if (!findGameById(i)) {
            if (!await Game.findOne({id: i}).exec()) { // TODO: Find more time-efficient way of doing this
                return i;
            }
        }
    }
    console.log('FATAL ERROR: Ran out of ids! Using random number from 1 to 1 million and praying it hasn\'t been used before')
    return Math.floor(Math.random() * 1000000)
}

function findGames() {
    return ongoingGames
}

function findUnstartedGame(callback) {
    for (var game of ongoingGames) {
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

class GameClass {
    constructor(id, options, text, gameEndCallback) {
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

        var playersGameArray = []
        for (var player of this.players) {
            if (!player.saveData || !player.final) continue

            if (player.id) {
                return playersGameArray.push({
                    player: player.id,
                    wpm: player.wpm
                })
            }
            playersGameArray.push({ // User is a guest
                player: {
                    username: player.username
                },
                wpm: player.wpm
            })
        }

        new Game({
            id: this.id,
            players: playersGameArray,
            date: new Date().getTime()
        }).save((err) => {
            if (err)
                return console.log(err)
            Game.findOne({}).populate('players.player').exec((err, game) => {
                console.log(game)
            })
        })

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