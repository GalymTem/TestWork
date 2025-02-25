const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    question:{
        type: String,
        required: true,
        trim: true
    },
    variantA: {
        type: String,
        required: true,
        trim: true
    },
    variantB: {
        type: String,
        required: true,
        trim: true
    },
    variantC: {
        type: String,
        required: true,
        trim: true
    },
    variantD: {
        type: String,
        required: true,
        trim: true
    }
})

const questionModel = mongoose.model("questions", schema)
module.exports = questionModel