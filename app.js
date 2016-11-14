const Twitter = require('twitter');
const express = require('express');

var app = express();

var creds = {
    consumer_key: process.env.TWITTER_CONSUMER_KEY.trim(),
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET.trim(),
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY.trim(),
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET.trim(),
};
console.log(creds);
var client = new Twitter(creds);

var processedTweets = {};
var since_id = null;

var tweetsCache = null;
setInterval(function () {
    tweetsCache = null;
}, 10000);

app.get('/twitter/:hashtag', function (req, res) {
    if (tweetsCache) {
        res.json(tweetsCache);
    }
    else {
        var params = {
            q: '#'+req.params.hashtag,
        };
        if (!since_id) {
            params.count = 50;
        }
        else {
            params.since_id = since_id;
        }
        client.get('search/tweets', params, function(error, data){
            if (error) {
                res.status(500).json({
                    error: error
                });
            }
            else {
                var filtered = data.statuses.filter(function (tweet) {
                    if (!processedTweets[tweet.id_str]) {
                        processedTweets[tweet.id_str] = true;
                        return true;
                    }
                    else {
                        return false;
                    }
                });
                console.log ("new tweets " + filtered.length + "/" + data.statuses.length);
                data.statuses = filtered;
                data.statuses_orig = data.statuses;

                if (!since_id) {
                    filtered.sort(function(a, b) {
                        return +(a.id_str > b.id_str) || +(a.id_str === b.id_str) - 1;
                    });
                    since_id = filtered[filtered.length-1].id_str;
                    // console.log("largest "+ since_id)
                    // console.log("smallest "+ filtered[0].id_str)
                    // console.log(filtered[0].id_str < since_id);
                }
                tweetsCache = data;
                res.json(data);
            }
        });
    }
});

app.use(express.static('./'));

app.listen(8080, function () {
    console.log('Listening on port 8080');
});