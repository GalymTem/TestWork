const express = require('express')
const router = express.Router()
const Questions = require('../models/questions')
const NUMBER_OF_QUESTIONS = 10

function shuffle(arr){
    return arr.map(value => ({value, sort: Math.random()}))
        .sort((a, b) => a.sort - b.sort)
        .map(({value}) => value)
}
/*
app.get('/', (req, res) => {
    Questions.find().then((models) => {
        let elem = shuffle(models)
        elem = elem.slice(0, NUMBER_OF_QUESTIONS)
        let questions = []
        for(let i = 0;i < questions.length;i++){
            let temp = []
            temp.append({index: 0, variant: elem[i].variantA})
            temp.append({index: 1, variant: elem[i].variantB})
            temp.append({index: 2, variant: elem[i].variantC})
            temp.append({index: 3, variant: elem[i].variantD})
            temp = shuffle(temp)
            questions.append(temp)
        }
        res.render('quiz', {questions: elem, variants: questions})
    })
})

*/
module.exports = router