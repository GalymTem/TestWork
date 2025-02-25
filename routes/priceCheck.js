const express = require('express')
const PriceHistory = require('../models/priceHistory')
const router = express.Router()


function loadHistory(res, price){
    PriceHistory.find().then((queries) => {
        res.render('steamPrice', {queries: queries.toReversed(), price: price})
    })
}
router.get('/', (req, res) => {
    loadHistory(res, "")
})

router.post('/check', async (req, res) => {
    const {game, country} = req.body;
    const url = `https://store.steampowered.com/api/appdetails?appids=${game}&cc=${country}&filters=price_overview`
    const ApiResponse = await fetch(url);
    let data = await ApiResponse.json();
    data = data[game]
    if(!data || (!data['success'])){
        loadHistory(res, "Oops! can't find data")
    }else {
        let historyChannel = new PriceHistory()
        historyChannel.game = game
        historyChannel.code = country
        historyChannel.when = Date()
        historyChannel.save().then(() => {
            let price = data['data']['price_overview']['final_formatted']
            loadHistory(res, `${price}`)
        })
    }
})

module.exports = router