const config = require('./our-config.json')
const fs = require(`fs`)
const moment = require('moment')
const path = require(`path`)
const initFacebook = require(`./init-facebook`)

let FB = initFacebook();

let filenameOut = `./download/reactions_result.json`;

function loadReactions() {
    return new Promise((resolve, reject) => {
        FB.api(
            `/${config.objectId}/reactions?fields=type&summary=total_count&limit=999`,
            'GET',
            {},
            function(response) {
                // Insert your code here
                if (response.error) reject(response.error);
                else {
                    resolve(response);
                }
            }
        );
    })
}

function saveReactions(filenameOut) {
    return new Promise((resolve, reject)=> {
        loadReactions().then((data)=> {
            fs.writeFile(filenameOut, JSON.stringify(data, null, '\t'), function (err) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve()
                }
            });
        }, reject)
    })
}

function getReactions() {
    let json = fs.readFileSync(`download/reactions_result.json`);
    json = JSON.parse(json);

    let result = {
        types: {},
        reactionCount: {}
    };

    let reactionCount = result.reactionCount

    json.data.forEach((item) => {
        if (!result[item.type]) {
            result.types[item.type] = item.type
        }

        if (!reactionCount[item.type]) {
            reactionCount[item.type] = 1;
        }
        else {
            reactionCount[item.type] += 1
        }
    })

    return result
}

// saveReactions(filenameOut).then(console.log, console.log)
// console.log(getReactions())

module.exports = {
    getReactions: getReactions,
    saveReactions: saveReactions,
}

