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
    keybinds: {
        type: Object, /* newGame, mainMenu */
        default: {}
    },
    admin: {
        type: Boolean,
        default: false
    }
})

userSchema.plugin(findOrCreate);
userSchema.plugin(function getPastGamesPlugin(schema) {
    schema.statics.getPastGames = function getPastGames(id, callback) {
        require ('./index.js').Game.find({}, (err, games) => {
            var pastGames = []
            for (var game of games) {
                for (var playerObject of game.players) {
                    if (playerObject.player.equals(id)) {
                        var gameObject = game.toObject()
                        gameObject.player = playerObject
                        pastGames.push(gameObject)
                        continue;
                    }
                }
            }
            callback(pastGames)
        })
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User