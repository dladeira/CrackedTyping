const mongoose = require('mongoose')
const findOrCreate = require('mongoose-findorcreate')

const userSchema = new mongoose.Schema({
    googleId: String,
    githubId: String,
    username: String,
    description: {
        type: String,
        default: ""
    },
    pastGames: [{
        wpm: Number,
        date: Date
    }]
})

userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema)

module.exports = User