const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    description: {
        type: String,
        required: false,
        trim: true
    },
    url: {
        type: String,
        required: false,
        trim: true
    }
})

const generalModel = mongoose.model("general", schema)

module.exports = generalModel