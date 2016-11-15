const express = require('express');
const {getReactions} = require('./fetch-data')

var app = express();


app.get('/percentages', (req, res) => {
    res.json({
        data: {
            ANGRY: Math.random() * 100,
            WOW: Math.random() * 100,
            LIKE: Math.random() * 100,
            LOVE: Math.random() * 100,
        }
    });
})

module.exports = app