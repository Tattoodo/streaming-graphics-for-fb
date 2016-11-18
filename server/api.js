const path = require(`path`)
const md5 = require('md5')
const express = require('express')
const { loadNext, saveReactions, getReactions, ReactionsSerialized } = require('./fetch-data')

var app = express()

let Reaction = {
  NONE: `NONE`,
  HAHA: `HAHA`,
  THANKFUL: `THANKFUL`,
  ANGRY: `ANGRY`,
  WOW: `WOW`,
  LIKE: `LIKE`,
  LOVE: `LOVE`,
  SAD: `SAD`
}

let types = [ Reaction.LOVE, Reaction.LIKE, Reaction.ANGRY, Reaction.WOW ]

let lastObjectId = 0

app.get(`/reactions/:objectId`, (req, res) => {
  if (req.params.objectId) {
    let cacheFile = path.join(__dirname, '/download/', md5(req.params.objectId) + '.json')

    getReactions(cacheFile, types).then(
      (result) => {
        res.json(result)
      },
      (reason) => {
        res.status(500).json({ error: reason })
      })
      .catch(
        (ex) => {
          res.status(500).json({ error: ex })
        })
  } else {
    res.sendStatus(400)
  }
})

app.get('/percentages', (req, res) => {
  let cacheFile = path.join(__dirname, '/download/', md5(lastObjectId) + '.json')

  getReactions(cacheFile, types).then(
    (result) => {
      console.log(result)
      res.json(result)
    },
    (reason) => {
      res.status(500).json({ error: reason })
    })
    .catch(
      (ex) => {
        res.status(500).json({ error: ex })
      })
})

app.get('/start/:objectId', (req, res) => {
  let objectId = req.params.objectId
  let url = `/${objectId}/reactions?fields=type&limit=5000&access_token=${req.query.access_token}`

  let cacheFile = path.join(__dirname, '/download/', md5(lastObjectId) + '.json')

  loadNext(url).then((result) => {
    console.log('--- results: ' + result.data.length)
    if (result.data.length < 10) {
      console.log(result)
      console.log('---')
    }

    let dbFormat = new ReactionsSerialized()
    dbFormat.data = result.data
    dbFormat.cursors = result.cursors
    return saveReactions(dbFormat, cacheFile)
  }, (reason) => {
    console.log(reason)
    res.sendStatus(500)
  })
    .then(function () {
      lastObjectId = objectId
      console.log('ready to serve '+lastObjectId + ' saved ' +cacheFile)
      res.sendStatus(200)
    }, (reason) => {
      console.log(reason)
      res.sendStatus(500)
    })
})

app.get('/stop', (req, res) => {

})

module.exports = app
