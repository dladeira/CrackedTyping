const mongoose = require('mongoose')
const { Text, Game, Script } = require('./models/index.js')
const config = require('config')

var ongoingGames = []
var ongoingInfinites = []

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
    console.log('FATAL ERROR: Ran out of ids! Using random number from 1 to 1 billion and praying it hasn\'t been used before')
    return Math.floor(Math.random() * 1000000000)
}

async function findUnusedIdInfinite() {
    // i can't be bothered to actually save infinite games
    // 
    // for (var i = 1; i < 999999999; i++) { // 1 billion possible games
    //     if (!findGameById(i)) {
    //         if (!await Game.findOne({id: i}).exec()) { // TODO: Find more time-efficient way of doing this
    //             return i;
    //         }
    //     }
    // }
    // console.log('FATAL ERROR: Ran out of ids! Using random number from 1 to 1 billion and praying it hasn\'t been used before')
    return Math.floor(Math.random() * 1000000000)
}

function findGames() {
    return ongoingGames
}

function findInfiniteById(id) {
    for (var infinite of ongoingInfinites) {
        if (infinite.id == id)
            return infinite
    }
    return undefined
}

function findUnstartedGame(callback) {
    for (var game of ongoingGames) {
        if (game.timeSinceStart < -3000) {
            callback(game)
            return
        }
    }
    createGame(config.get('game.defaultOptions'), callback)
}

function getRandomText(callback) {
    Text.find({}, (err, texts) => {
        if (err) {
            console.log(err)
            return callback(config.get('game.defaultText'))
        }
        callback(texts[parseInt(Math.random() * texts.length)])
    })
}




function createInfinite(options, callback) {
    findUnusedIdInfinite().then(id => {
        getRandomScript(script => {
            var newInfinite = new InfiniteClass(id, options, script, () => {
                ongoingInfinites.splice(findInfiniteById(id), 1)
            })
            ongoingInfinites.push(newInfinite)
            callback(newInfinite)
        })
    })
}

function findInfinite(callback) {
    for (var game of ongoingInfinites) {
        console.log(game.options.gameLength - game.timeSinceStart)
        if (game.options.gameLength - game.timeSinceStart < 15000) { // Join game if there is at least 15 seconds left
            callback(game)
            return
        }
    }
    createInfinite(config.get('game.infiniteOptions'), callback)
}

function getRandomScript(callback) {
    Script.find({}, (err, scripts) => {
        if (err) {
            console.log(err)
            return callback(config.get('game.defaultText'))
        }
        callback(scripts[parseInt(Math.random() * scripts.length)])
    })
}

exports.findGameById = findGameById
exports.findUnstartedGame = findUnstartedGame
exports.findGames = findGames

exports.getRandomText = getRandomText
exports.getRandomScript = getRandomScript

exports.findInfinite = findInfinite
exports.findInfiniteById = findInfiniteById

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

        setTimeout(() => { // Don't delete game instantly (slow internet connections might finish later)
            var playersGameArray = []
            var guestsGameArray = []
            for (var player of this.players) {
                if (!player.final) continue

                if (player.id) {
                    playersGameArray.push({
                        player: player.id,
                        wpm: player.wpm
                    })
                } else {
                    guestsGameArray.push({ // User is a guest
                        guest: {
                            username: player.username
                        },
                        wpm: player.wpm
                    })
                }
            }
            new Game({
                id: this.id,
                players: playersGameArray,
                guests: guestsGameArray,
                date: new Date().getTime()
            }).save((err) => {
                if (err)
                    return console.log(err)
            })
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

class InfiniteClass {
    constructor(id, options, script, gameEndCallback) {

        this.options = options
        this.id = id
        this.gameEndCallback = gameEndCallback
        this.script = script
        this.startTime = new Date().getTime() + this.options.startDelay
        this.deleteDelay = this.options.deleteDelay

        setTimeout(() => {
            this.startGame()
        }, this.options.startDelay)

        // Set startTime ahead of time
        this.players = []
    }

    startGame() {
        console.log(`Infinite ${this.id} started with ${this.players.length} players`)
        setTimeout(() => {
            this.endGame()
        }, this.options.gameLength)
    }

    endGame() {
        console.log(`Infinite ${this.id} ended`)

        setTimeout(() => { // Don't delete game instantly (slow internet connections might finish later)
            var playersGameArray = []
            var guestsGameArray = []
            for (var player of this.players) {
                if (!player.final) continue

                if (player.id) {
                    playersGameArray.push({
                        player: player.id,
                        wpm: player.wpm
                    })
                } else {
                    guestsGameArray.push({ // User is a guest
                        guest: {
                            username: player.username
                        },
                        wpm: player.wpm
                    })
                }
            }
            /*new Game({
                id: this.id,
                players: playersGameArray,
                guests: guestsGameArray,
                date: new Date().getTime()
            }).save((err) => {
                if (err)
                    return console.log(err)
            })*/
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
        return this.script.passage
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

    setPlayerWPM(username, wpm, final, character) {
        for (var player of this.players) {
            if (player.username == username) {
                if (!this.playerFinished(username)) {
                    player.wpm = wpm
                    player.final = final
                    player.character = character
                }
            }
        }
    }
}