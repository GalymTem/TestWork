const express = require('express')
const app = express()
const ejs = require('ejs')
const mongoose = require('mongoose')
const fs = require('fs')
const bcrypt = require('bcrypt');
const axios = require('axios')
const bodyParser = require('body-parser')
const Users = require('./models/users')
const Items = require('./models/items')
const Questions = require('./models/questions')
const General = require('./models/general')
const path = require('path')
const session = require('express-session')
const WEATHER_API_KEY = "d83716d85906320ec9f1e42a06418b0a"
const PORT = 3000
var loggedIn = false
var main = fs.readFileSync('./views/mainPage.ejs', 'utf-8')
var admin = fs.readFileSync('./views/admin.ejs', 'utf-8')
const uri = 'mongodb+srv://admin:7VNevS5u90fQbwPG@cluster0.88dfs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
// mongodb+srv://admin:P3tH3Hfb1ngpos3D@userslog.1yvoj.mongodb.net/?retryWrites=true&w=majority&appName=UsersLog
//
var isAdmin = false
const saltRounds = 10

function authUser(req, res, next) { // CHANGE
    if(req.session && req.session.user){
        return next()
    }
    return res.redirect('/')
}
function authAdmin(req, res, next){

    if(req.session && req.session.user && req.session.adminStatus){
        return next()
    }
    return res.redirect('/mainPage')
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + '../public')));
app.use(express.json());
app.use(session({
    secret: "key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 }
}))
app.set('view engine', 'ejs')

const adminRouter = require('./routes/admin')
const quizRouter = require('./routes/questions')
const gameRouter = require('./routes/gameSearch')
const priceRouter = require('./routes/priceCheck')
app.use('/admin', authAdmin, adminRouter) // app.use('/admin', authAdmin, adminRouter)
app.use('/questions', authUser, quizRouter)
app.use('/search', authUser, gameRouter) // add gameRouter
app.use('/steam', authUser, priceRouter)
mongoose.connect(uri).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err))


app.get('/', (req, res) => {
    res.render('loginPage', {ERROR_LOG: ""})
})
app.get('/weather', authUser, async (req, res) => {

    const { lat = 51.15, lon = 71.42 } = req.query;

    const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
    );
    const weatherData = weatherResponse.data;

    const { temp, feels_like, humidity, pressure } = weatherData.main;
    const { speed: windSpeed } = weatherData.wind;
    const { icon, description } = weatherData.weather[0];
    const { country } = weatherData.sys;
    const rain = weatherData.rain ? weatherData.rain["3h"] : "No recent rain";
    var curDate = new Date(Number(weatherData["dt"]) * 1000);
    curDate.setHours(curDate.getHours() + 5);
    var dt_txt = curDate.toISOString();
    res.render('weather', {CURRENT: dt_txt.substring(11, 19), TEMP: temp, FEEL: feels_like,
        HUM: humidity, PRESS: pressure, WIND: windSpeed, CODE:country, DESC:description, ICON:icon})
})
app.get('/mainPage', authUser, (req, res) => {

    Items.find().then(items => {
        General.findOne().then((info) => {
            res.render('mainPage', {items: items, desc:info.description, url:info.url})
        })
    })
})
app.get('/register', (req, res) => {
    let ERROR_LOG = ""
    res.render("registerPage", {ERROR_LOG})
})
app.post('/register', (req, res) => {
    const {name, password} = req.body
    var userChannel = new Users()
    Users.find({username: name}).then((users) => {
        if(users.length == 0){
            let currentTime = new Date()
            bcrypt.hash(password, saltRounds, function(err, hash) {
                if(err){
                    console.log(err)
                }
                userChannel.username = name
                userChannel.password = hash
                userChannel.userID = users.length
                userChannel.creationDate = currentTime
                userChannel.adminStatus = false
                userChannel.deletionDate = currentTime
                userChannel.updateDate = currentTime
                userChannel.save().then(() => {

                    res.redirect('/')
                })
            });
        }else{
            let ERROR_LOG = "This username is already chosen. Please choose another"
            res.render('registerPage', {ERROR_LOG})
        }
    })
})
app.get('/logout', (req, res) => {
    req.session.user = null
    req.session.adminStatus = false
    res.redirect('/')
})
app.post('/login', async (req, res) => {
    const {username, password} = req.body
        await Users.find().then((models) => {

            let have = false
            for (let i = 0; i < models.length; i++) {
                if(models[i].username == username){
                    have = true
                }
            }
            if(!have){
                res.redirect('/')
            }
            for (let i = 0; i < models.length; i++) {
                if(models[i].username == username){
                     bcrypt.compare(password, models[i].password, function(err, result) {
                        if (result) {
                            change = false
                            isAdmin = models[i].adminStatus
                            req.session.user = username
                            req.session.adminStatus = models[i].adminStatus
                            if(req.session.adminStatus) {
                                res.redirect('/admin')
                            }else{
                                res.redirect('/mainPage')
                            }
                        }else{
                            res.redirect('/')
                        }
                    });
                }
            }
        })

})

const NUMBER_OF_QUESTIONS = 5
function shuffle(arr){
    return arr.map(value => ({value, sort: Math.random()}))
        .sort((a, b) => a.sort - b.sort)
        .map(({value}) => value)
}

app.get('/quiz', (req, res) => {
    Questions.find().then((models) => {
        let elem = shuffle(models)
        elem = elem.slice(0, NUMBER_OF_QUESTIONS)
        let questions = []
        for(let i = 0;i < elem.length;i++){
            let temp = []
            temp.push({index: 0, variant: elem[i].variantA})
            temp.push({index: 1, variant: elem[i].variantB})
            temp.push({index: 2, variant: elem[i].variantC})
            temp.push({index: 3, variant: elem[i].variantD})
            temp = shuffle(temp)
            questions.push(temp)
        }
        res.render('quiz', {questions: elem, variants: questions})
    })
})
app.post('/quiz/submit', (req, res) => {
    // ...
    const answers = req.body;
    let correct_answers = 0
    for(let i = 0;i < NUMBER_OF_QUESTIONS;i++){
        correct_answers += (answers[`${i}`] == 0)
    }
    res.render('quizEnd', {correct_answers: correct_answers, NUMBER_OF_QUESTIONS: NUMBER_OF_QUESTIONS})

})
//app.get('/admin', (req, res) => {res.render('admin')})
app.listen(PORT, () =>{
    console.log(`Server is running on ${PORT}`)
})

