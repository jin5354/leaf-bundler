const writeChunk = require('./writeChunk.js')

const BOOTSTRAP_STRING = `/******/(function(modules) {
  /******/	var installedModules = {};
  /******/	function require(moduleId) {
  /******/		if(installedModules[moduleId])
  /******/			return installedModules[moduleId].exports;
  /******/		var module = installedModules[moduleId] = {
  /******/			exports: {}
  /******/		};
  /******/		modules[moduleId](module, module.exports, require);
  /******/		return module.exports;
  /******/	}
  /******/	return require(0);
  /******/})`

function generateOutputJS(depTree) {
  let buffer = []
  buffer.push(BOOTSTRAP_STRING)
  buffer.push('/******/({\n')
  let chunks = writeChunk(depTree)
  buffer.push(chunks)
  buffer.push('/******/})')
  buffer = buffer.join('')
  return buffer
}

module.exports = generateOutputJS
