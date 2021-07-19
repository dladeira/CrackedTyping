const mongoose = require('mongoose')

const textSchema = new mongoose.Schema({
    passage: String, // passages to use "" and not ''
    timesTyped: {
        type: Number,
        default: 0
    },
    totalWPM: { // The total WPM ever typed on this passage (to use in average WPM calculation)
        type: Number,
        default: 0
    }

})

const Text = mongoose.model('Text', textSchema)

module.exports = Text;