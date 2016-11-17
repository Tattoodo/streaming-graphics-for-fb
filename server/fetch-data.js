const fs = require(`fs`)
const path = require(`path`)

const config = require('./our-config.json')
const initFacebook = require(`./init-facebook`)

let FB = initFacebook();


function loadReactions(url) {
    return new Promise((resolve, reject) => {
        FB.api(
            url,
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

function saveReactions(data, filename) {
    return new Promise((resolve, reject)=> {
        fs.writeFile(filename, JSON.stringify(data, null, '\t'), function (err) {
            if (err) {
                reject(err)
            }
            else {
                resolve()
            }
        });

    })
}

function getReactions(path) {
    return new Promise((resolve, reject)=>{
        fs.readFile(path, (err, contents)=>{
            if (err) {
                reject()
            }
            else  {
                let list = JSON.parse(contents);

                let model = {
                    types: {},
                    reactionCount: {}
                };
                let reactionCount = model.reactionCount

                list.forEach((item) => {
                    if (!model[item.type]) {
                        model.types[item.type] = item.type
                    }

                    if (!reactionCount[item.type]) {
                        reactionCount[item.type] = 1;
                    }
                    else {
                        reactionCount[item.type] += 1
                    }
                })

                resolve(model)
            }

        });

    })
}


function loadNext(url, inputPages) {
    let pages = inputPages || [];

    return new Promise((resolve, reject) => {

        loadReactions(url).then((response) => {
            if (response.data instanceof Array) {
                pages = pages.concat(response.data)
            }
            else {
                console.log("no data???");
            }
            if (response.paging && response.paging.next) {
                console.log("loading next page...")
                loadNext(response.paging.next.replace(`https://graph.facebook.com/${config.version}`,``), pages).then((morePages)=>{
                    resolve(morePages);
                }, reject);
            }
            else {
                console.log("no next page.")
                resolve(pages)
            }

        }, reject);

    });
}

module.exports = {
    loadNext: loadNext,
    saveReactions: saveReactions,
    getReactions: getReactions,
}

