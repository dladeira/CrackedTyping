const mongoose = require('mongoose')

const contributionSchema = new mongoose.Schema({
    contributionType: Number, // 0 = Text, 1 = Script
    contributionValue: String,
    contributionAuthor: String // ID of the author
})

const contributionModel = mongoose.model('Contribution', contributionSchema)

module.exports = contributionModel