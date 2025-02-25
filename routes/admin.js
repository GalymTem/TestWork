var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
// const Users = require("../models/users")
const Items = require("../models/items")
const Users = require("../models/users")
const Questions = require('../models/questions')
const General = require('../models/general')
const {raw} = require("body-parser");
const {load} = require("debug");
var id_counter = 0
const saltRounds = 10


// Users
function loadUsers(res, ERROR_LOG){

    Users.find().then((users) => {
        General.findOne().then((info) => {

            res.render('admin', {ERROR_LOG: ERROR_LOG, users: users, desc:info.description, url:info.url})

        })
    })
}
router.get('/', (req, res) => {
    loadUsers(res, "")
})
router.post('/addUser', (req, res) => {
    const {username, password, adminStatus} = req.body
    var userModel = new Users()
    let currentTime = new Date()
    Users.find({username: username}).then( (have) => {
        if (have.length){
            loadUsers(res, "This username is already taken")
        }else {
            Users.find().then((users) => {
                bcrypt.hash(password, saltRounds, function (err, hash) {
                    if (err) {
                        console.log(err)
                    }
                    userModel.username = username
                    userModel.password = hash
                    userModel.userID = users.length
                    userModel.creationDate = currentTime
                    userModel.adminStatus = (adminStatus === "on")
                    userModel.deletionDate = currentTime
                    userModel.updateDate = currentTime

                    userModel.save().then(() => {
                        loadUsers(res, "")
                    })
                })
            })
        }
    })
})
router.post('/delete/:id', async (req, res) => {
    const userId = req.params.id;

    await Users.findByIdAndDelete(userId);
    res.redirect('/admin')
})
router.get('/editUser/:id', async (req, res) => {
    const userId = req.params.id;
    Users.findById(userId).then((user) => {
        res.render('userEdit', {user: user})
    })
})
router.post('/editUser/:id', async (req, res) => {
    const userId = req.params.id;
    const {username, password, adminStatus} = req.body
    bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
            console.log(err)
        }
        Users.findByIdAndUpdate(userId, {username: username, password: hash, adminStatus:(adminStatus == "on"), updateDate:Date()}, {upsert: false}).then(() => {
            loadUsers(res, "")
        })
    })

})
// Items

function loadItems(res, ERROR_LOG){

    Items.find().then((items) => {
        res.render('itemsManage', {ERROR_LOG: ERROR_LOG, items: items})

    })

}

router.post('/delItem/:id', async (req, res) => {
    const itemId = req.params.id
    await Items.findByIdAndDelete(itemId)
    loadItems(res, "")
})
router.post('/editItem/:id', async (req, res) => {
    const {url1, url2, url3, name_ru, name_en, desc_ru, desc_en} = req.body;
        console.log(url1, url2, url3, name_ru, name_en, desc_ru, desc_en)
        await Items.findByIdAndUpdate(req.params.id, {
            url1: url1,
            url2: url2,
            url3: url3,
            name_ru: name_ru,
            name_en: name_en,
            desc_ru: desc_ru,
            desc_en: desc_en
        }, {}).then(() => {

            console.log(req.params.id)
            loadItems(res, "")
        })

})

router.post('/addItem', async (req, res) => {
    const {url1, url2, url3, name_ru, name_en, desc_ru, desc_en} = req.body;
    var itemsChannel = new Items()
    let maxId = 1
    itemsChannel.url1 = url1
    itemsChannel.url2 = url2
    itemsChannel.url3 = url3
    itemsChannel.name_ru = name_ru
    itemsChannel.name_en = name_en
    itemsChannel.desc_ru = desc_ru
    itemsChannel.desc_en = desc_en
    itemsChannel.save().then(() => {
        loadItems(res, "")
    })

})

router.get('/editItem/:id', async (req, res) => {
    const itemId = req.params.id;
    Items.findById(itemId).then((item) => {
        res.render('editPage', {elem: item});
    })

})

router.get('/itemsManage', async (req, res) => {
    loadItems(res, "")
})

// Quiz
function loadQuestions(res){

    Questions.find().then((questions) => {
        res.render('quizManage', {questions: questions})

    })
}
router.get('/quizManage', (req, res) => {
    loadQuestions(res)
})

router.post('/addQues', (req, res) => {
    const {question, correct, second, third, fourth} = req.body
    let quesChannel = new Questions()
    quesChannel.question = question
    quesChannel.variantA = correct
    quesChannel.variantB = second
    quesChannel.variantC = third
    quesChannel.variantD = fourth
    quesChannel.save().then(() => {
        loadQuestions(res)
    })
})
router.post('/delQues/:id', async (req, res) => {
    const questionID = req.params.id;
    await Questions.findByIdAndDelete(questionID)

    loadQuestions(res)
})
router.get('/editQues/:id', (req, res) => {
    const questionId = req.params.id
    Questions.findById(questionId).then(question => {

        res.render('quesEditPage', {question: question})
    })
})
router.post('/editQues/:id', async (req, res) => {
    const questionId = req.params.id
    const {question, correct, second, third, fourth} = req.body;
    await Questions.findByIdAndUpdate(questionId, {question: question, variantA: correct, variantB: second, variantC: third, variantD: fourth}, {upsert: false}).then(() => {
        loadQuestions(res)
    })
})

// WELCOME PAGE

router.post('/editWelcome', async (req, res) => {
    const {description, url} = req.body;
    General.updateOne({}, {description: description, url: url}, {upsert: false}).then((result) => {
        loadUsers(res, "")
    })
})

module.exports = router;