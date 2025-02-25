const express = require('express')
const router = express.Router()
const SearchHistory = require('../models/searchHistory')

const rawgApiKey = 'fc28521430104c75829d34012b56ce48';
const apiKeyGiantBomb = '6a1792b69a6abdb655faf20673978c5ec89f341f';
function loadHistory(res, results){
    SearchHistory.find().then((queries) => {
        res.render('gameSearch', {rawgGames: results, queries: queries.toReversed()})
    })
}
router.get('/', async (req, res) => {
    const query = req.query.query || '';
    const genre = req.query.genre || '';

    const rawgUrl = `https://api.rawg.io/api/games?key=${rawgApiKey}&page_size=10&search=hello&genres=action`;
    const rawgResponse = await fetch(rawgUrl);
    const rawgData = await rawgResponse.json();
    loadHistory(res, rawgData.results)
   // res.render('gameSearch', {rawgGames: rawgData.results})
})
router.post('/query', async (req, res) => {
    const {search, genre} = req.body

    let rawgUrl = `https://api.rawg.io/api/games?key=${rawgApiKey}&page_size=10&search=${search}&genres=${genre}`;
    if(genre === "none"){
        rawgUrl = `https://api.rawg.io/api/games?key=${rawgApiKey}&page_size=10&search=${search}`;
    }
    try{
        const rawgResponse = await fetch(rawgUrl);
        const rawgData = await rawgResponse.json();
        let historyChannel = new SearchHistory()
        historyChannel.query = search
        historyChannel.genre = genre
        historyChannel.when = Date()
        historyChannel.save().then(() => {
            loadHistory(res, rawgData.results)
        })
        //const giantBombResponse = await fetch(giantBombUrl);
        //const giantBombData = await giantBombResponse.json();
    }catch (error){
        console.log(error)
    }
})
module.exports = router