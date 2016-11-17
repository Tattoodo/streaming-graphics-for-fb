const path = require(`path`)
const md5 = require('md5')
const express = require('express');
const {loadNext, saveReactions, getReactions} = require('./fetch-data')

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

app.get(`/reactions/:objectId`, (req, res) => {
    if (req.params.objectId) {
        let cacheFile = path.normalize(path.join(__dirname, '/download/', md5(req.params.objectId), '.json'))

        getReactions(cacheFile).then((result) => {
                res.json(result)
            },
            (reason) => {
                res.status(500).json({error: reason})
            })
    }
    else {
        res.sendStatus(400)
    }
})

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

    let url = `/${req.params.objectId}/reactions?fields=type&summary=total_count&limit=1`;

    let cacheFile = path.normalize(path.join(__dirname,  '/download/', md5(req.params.objectId), '.json'))

    loadNext(url).then((result) => {

        console.log('--- results: ' + result.length)
        if (result.length < 10) {
            console.log(result)
            console.log('---')
        }

        return saveReactions(result, cacheFile);

    }, (reason) => {
        console.log(reason)
        res.sendStatus(500)
    })
    .then(function () {
        res.sendStatus(200)
    },(reason) => {
        console.log(reason)
        res.sendStatus(500)
    })

})

app.get('/stop', (req, res) => {

})



module.exports = app