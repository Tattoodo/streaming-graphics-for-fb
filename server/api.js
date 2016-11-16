const express = require('express');
const {getReactions} = require('./fetch-data')

var app = express();

let types = ['LOVE', 'LIKE', 'ANGRY', 'WOW']
let counts = {
    ANGRY: 0,
    WOW: 0,
    LIKE: 0,
    LOVE: 0,
}

function count(counts) {
    let res = 0;
    for (var i in counts) if (counts.hasOwnProperty(i)) {
        res += counts[i]
    }
    return res;
}

mockUpdate()
function mockUpdate() {
    let randomItem = types[Math.floor(Math.random()*4)];
    // counts[randomItem] += Math.ceil(Math.random()*3);
    counts[randomItem] += 1;
    setTimeout(mockUpdate, 300)
}

app.get('/percentages', (req, res) => {
    let totalCount = count(counts);
    let data = {}

    types.forEach((key)=>{
        let n = counts[key];
        data[key] = Math.round( n / totalCount * 10000) / 100;
    })

    data.errorMargin = 0
    types.forEach((key)=>{
        data.errorMargin += data[key]
    })
    data.errorMargin = Math.abs( data.errorMargin - 100 )


    res.json({
        data: data
    });
})

app.get('/start/:objectId', (req, res) => {

})

app.get('/stop', (req, res) => {

})

module.exports = app