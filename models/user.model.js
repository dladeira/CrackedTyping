const mongoose = require('mongoose')
const config = require('config')
const findOrCreate = require('mongoose-findorcreate')

const userSchema = new mongoose.Schema({
    googleId: String,
    githubId: String,
    username: String,
    avatar: {
        type: String,
        default: config.get('account.defaults.avatar')
    },
    description: {
        type: String,
        default: ""
    },
    pastGames: [{
        wpm: Number,
        date: Date
    }],
})

userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema)

module.exports = User