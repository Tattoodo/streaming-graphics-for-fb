const express = require('express')
const api = require(`./api`)
const path = require(`path`)

var app = express()

app.use(`/api/`, api)

app.use(`/`, express.static(path.join(__dirname, `/../dashboard`)))

app.listen(8080, function () {
  console.log('Listening on port 8080')
})
