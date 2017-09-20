const path = require('path')
const parse = require('./parse.js')
const buildDeps = require('./buildDeps.js')

async function bundler(config, configPath) {
  let entryFileStr = config.entry
  let outputFileStr = config.output.filename
  let configDirname = path.dirname(configPath)
  let entryFilePath = path.resolve(configDirname, entryFileStr)
  let entryDirname = path.dirname(entryFilePath)

  console.log({
    input: entryFilePath,
    context: entryDirname,
    output: path.resolve(configDirname, outputFileStr)
  })

  let depTree = await buildDeps(entryFileStr, {
    input: entryFilePath,
    context: entryDirname,
    output: path.resolve(configDirname, outputFileStr)
  })
}

module.exports = bundler
