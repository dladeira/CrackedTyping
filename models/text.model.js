const mongoose = require('mongoose')

const textSchema = new mongoose.Schema({
    passage: String,
    totalTimesTyped: { type: Number, default: 0 }

})

const Text = mongoose.model('Text', textSchema)

module.exports = Text;