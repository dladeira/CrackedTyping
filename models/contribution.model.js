const mongoose = require('mongoose')

const contributionSchema = new mongoose.Schema({
    contributionType: Number, // 0 = Text, 1 = Script
    contributionValue: String,
    contributionAuthor: String, // ID of the author,
    status: {// 0 = nothing, 1 = accepted, 2 = rejected
        type: Number,
        default: 0
    }
})

const contributionModel = mongoose.model('Contribution', contributionSchema)

module.exports = contributionModel