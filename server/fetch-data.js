const fs = require(`fs`)
const { Facebook } = require(`fb`)

function loadReactions (url) {
  let fb = new Facebook({ version: 'v2.8' })

  return new Promise((resolve, reject) => {
    fb.api(
      url,
      'GET',
      {},
      function (response) {
        if (response.error) {
          reject(response.error)
        }
        else {
          resolve(response)
        }
      }
    )
  })
}

class ReactionsSerialized {
  constructor () {
    this.data = []
    this.cursors = {}
  }
}

function saveReactions (data, filename) {
  if (!(data instanceof ReactionsSerialized)) {
    throw new Error(`wrong file contents`)
  }
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, JSON.stringify(data, null, '\t'), function (err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

class Reactions {
  constructor (types) {
    this.total = 0
    this.reactionCount = {}
    this.percentages = {}

    types.forEach((reaction) => {
      this.reactionCount[ reaction ] = 0
      this.percentages[ reaction ] = 0
    })
  }

  toJSON () {
    this.percentages = Reactions.calcPercentages(this.reactionCount)
    return this
  }

  static calcPercentages (reactions) {
    let percentages = {}

    let total = 0
    for (let key in reactions) {
      if (reactions.hasOwnProperty(key)) {
        total += reactions[ key ]
      }
    }
    for (let key in reactions) {
      if (reactions.hasOwnProperty(key)) {
        let float = reactions[ key ] / total
        let rounded = Math.round(float * 1000) / 10
        percentages[ key ] = rounded
      }
    }

    return percentages
  }
}

function getReactions (path, reactionsOfInterest) {
  let model = new Reactions(reactionsOfInterest)

  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, rawText) => {
      if (err) {
        reject()
      } else {
        let saved = JSON.parse(rawText)
        let reactionCount = model.reactionCount

        saved.data.forEach((item) => {
          // count up types of interest
          if (reactionCount[ item.type ] !== undefined) {
            reactionCount[ item.type ] += 1
            model.total += 1
          }
        })

        resolve(model)
      }
    })
  })
}

function loadNext (url, inputPages) {
  let pages = inputPages || { data: [], cursors: null }

  return new Promise((resolve, reject) => {
    loadReactions(url).then((response) => {
      pages.cursors = (response.paging) ? response.paging.cursors : null

      if (response.data instanceof Array) {
        pages.data = pages.data.concat(response.data)
      }

      if (response.paging && response.paging.next) {
        console.log(`loading next page...`)
        loadNext(response.paging.next.replace(`https://graph.facebook.com/${config.version}`, ``), pages).then((morePages) => {
          resolve(morePages)
        }, reject)
      } else {
        console.log(`no next page.`)
        resolve(pages)
      }
    }, reject)
  })
}

module.exports = {
  loadNext: loadNext,
  saveReactions: saveReactions,
  getReactions: getReactions,
  ReactionsSerialized: ReactionsSerialized
}

