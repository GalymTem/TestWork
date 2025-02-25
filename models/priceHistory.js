const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    game:{
        type: String,
        required: true,
        trim: true
    },
    code: {
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

const priceHistoryModel = mongoose.model("priceHistory", schema)
module.exports = priceHistoryModel