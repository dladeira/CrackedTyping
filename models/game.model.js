const mongoose = require('mongoose')

const gameSchema = new mongoose.Schema({
    id: Number,
    players: [{
        player: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        wpm: Number
    }],
    guests: [{
        guest: {
            username: String,
        },
        wpm: Number
    }],
    date: Date
})

const gameModel = mongoose.model('Game', gameSchema)

module.exports = gameModel