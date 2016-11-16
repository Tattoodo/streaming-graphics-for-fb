const config = require('./our-config.json')
const {Facebook, FacebookApiException} = require('fb')

function initFacebook() {
    let fb = new Facebook({version: config.version});

    if (config.access_token)
        fb.setAccessToken(config.access_token);

    return fb
}

module.exports = initFacebook