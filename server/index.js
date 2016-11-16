const express = require('express');
const api = require(`./api`)

var app = express();

app.use(`/api/`, api);

app.use(`/`, express.static(`dashboard`));

app.listen(8080, function () {
    console.log('Listening on port 8080');
});