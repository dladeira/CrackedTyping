const mongoose = require('mongoose')

const scriptSchema = new mongoose.Schema({
    passage: ''
})

const scriptModel = mongoose.model('Script', scriptSchema)

module.exports = scriptModel