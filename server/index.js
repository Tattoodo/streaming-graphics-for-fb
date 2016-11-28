const express = require('express')
const api = require(`./api`)
const path = require(`path`)

var app = express()

app.use(`/api/`, api)

app.use(`/`, express.static(path.join(__dirname, `/../dashboard`)))

function filterFileTypes (req, res, next) {
  console.log(req.path)
  if (req.path.indexOf(`.js`) > -1 ||
    req.path.indexOf(`.css`) > -1) {
    next()
  } else {
    next(new Error('Permission denied.'))
  }
}

app.use(`/node_modules/`, filterFileTypes)
app.use(`/node_modules/`, express.static(path.join(__dirname, `/../node_modules`)))

app.listen(8080, function () {
  console.log('Listening on port 8080')
})
