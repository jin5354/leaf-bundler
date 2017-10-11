const fs = require('fs')
const path = require('path')
const collectDeps = require('./collectDeps.js')
const writeChunk = require('./writeChunk.js')
const SINGLE_BOOTSTRAP = require('./singleTemplate.js')
const ASYNC_BOOTSTRAP = require('./asyncTemplate.js')

async function bundle(config, configPath) {
  let entryFileStr = config.entry
  let outputFileStr = config.output.filename
  let configDirname = path.dirname(configPath)
  let entryFilePath = path.resolve(configDirname, entryFileStr)
  let outputFilePath = path.resolve(configDirname, outputFileStr)
  let entryDirname = path.dirname(entryFilePath)
  let outputDirname = path.dirname(outputFilePath)

  let depTree = await collectDeps(entryFileStr, {
    input: entryFilePath,
    context: entryDirname,
    output: path.resolve(configDirname, outputFileStr)
  })

  for (let chunkId in depTree.chunks) {
    if (!depTree.chunks.hasOwnProperty(chunkId)) {continue}
    let buffer = []
    let chunk = depTree.chunks[chunkId]
    let filename = (chunk.id === 0 ? outputFilePath : path.join(outputDirname, chunk.id + '.chunk.js'))
    if (chunk.id === 0) {
      // 主 chunk
      if (Object.keys(depTree.chunks).length > 1) {
        buffer.push(ASYNC_BOOTSTRAP)
        buffer.push('/******/({\n')
      } else {
        buffer.push(SINGLE_BOOTSTRAP)
        buffer.push('/******/({\n')
      }
    } else {
      // jsonp chunk
      buffer.push('/*****/')
      buffer.push('webpackJsonp')
      buffer.push('(')
      buffer.push(chunk.id)
      buffer.push(', {\n')
    }

    // 拼接modules进对应的chunk中
    let chunks = writeChunk(depTree, chunk)
    buffer.push(chunks)
    buffer.push('/******/})')
    buffer = buffer.join('')

    // 写文件
    fs.writeFile(filename, buffer, 'utf-8', function(err) {
      if (err) {
        throw err
      }
    })
  }
}

module.exports = bundle
