const fs = require('fs')
const path = require('path')
const buildDeps = require('./buildDeps.js')
const generateOutputJS = require('./generateOutputJS.js')

async function bundle(config, configPath) {
  let entryFileStr = config.entry
  let outputFileStr = config.output.filename
  let configDirname = path.dirname(configPath)
  let entryFilePath = path.resolve(configDirname, entryFileStr)
  let outputFilePath = path.resolve(configDirname, outputFileStr)
  let entryDirname = path.dirname(entryFilePath)

  let depTree = await buildDeps(entryFileStr, {
    input: entryFilePath,
    context: entryDirname,
    output: path.resolve(configDirname, outputFileStr)
  })

  let outputJS = generateOutputJS(depTree)

  fs.writeFile(outputFilePath, outputJS, 'utf-8', function(err) {
    if (err) {
      throw err
    }
  })
}

module.exports = bundle
