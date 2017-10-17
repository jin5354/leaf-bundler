/******/(function(document) {
  /******/	return function(modules) {
  /******/		var installedModules = {}, installedChunks = {0:1};
  /******/		function require(moduleId) {
  /******/			if(typeof moduleId !== "number") throw new Error("Cannot find module '"+moduleId+"'")
  /******/			if(installedModules[moduleId])
  /******/				return installedModules[moduleId].exports
  /******/			var module = installedModules[moduleId] = {
  /******/				exports: {}
  /******/			};
  /******/			modules[moduleId](module, module.exports, require);
  /******/			return module.exports
  /******/		}
  /******/		require.ensure = function(chunkId, callback) {
  /******/			if(installedChunks[chunkId] === 1) return callback(require);
  /******/			if(installedChunks[chunkId] !== undefined)
  /******/				installedChunks[chunkId].push(callback)
  /******/			else {
  /******/				installedChunks[chunkId] = [callback]
  /******/				var head = document.getElementsByTagName('head')[0]
  /******/				var script = document.createElement('script')
  /******/				script.type = 'text/javascript'
  /******/				script.src = chunkId + '.chunk.js'
  /******/				head.appendChild(script)
  /******/			}
  /******/		};
  /******/		window.webpackJsonp = function(chunkId, moreModules) {
  /******/			for(var moduleId in moreModules)
  /******/				modules[moduleId] = moreModules[moduleId]
  /******/			var callbacks = installedChunks[chunkId]
  /******/			installedChunks[chunkId] = 1
  /******/			for(var i = 0; i < callbacks.length; i++)
  /******/				callbacks[i](require)
  /******/		};
  /******/		return require(0)
  /******/	};
  /******/})(document)/******/({
/******/0: function(module, exports, require) {

const a = require(/* ./a.js */1)
a()

require.ensure(1, () => {
  const b = require(/* ./b.js */2)
  b()
})



/******/},
/******/
/******/1: function(module, exports, require) {

function a() {
  console.log('module a function')
}

module.exports = a


/******/},
/******/
/******/})