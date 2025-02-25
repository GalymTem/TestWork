const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    query: {
        type: String,
        trim: true
    },
    genre: {
        type: String,
        required: true,
        trim: true
    },
    when: {
        type: Date,
        required: true,
        trim: true
    }
})

const searchHistoryModel = mongoose.model("searchHistory", schema)
module.exports = searchHistoryModel