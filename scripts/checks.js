const path = require(`path`)
const rimraf = require(`rimraf`)

let pathTo = path.resolve(path.join(__dirname, `/../server/download/*.json`))

let cacheDirJson = pathTo
rimraf(cacheDirJson, () => {
  console.log(`initial clear`)
})

