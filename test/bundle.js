/******/(function(modules) {
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
/******/})/******/({
/******/0: function(module, exports, require) {

const a = require('./a.js')
const b = require('./b.js')
const c = require('./a.js')()
const d = require('./a.js')(require('./b.js'))

a()
b()


/******/},
/******/
/******/1: function(module, exports, require) {

function a() {
  console.log('module a function')
}

module.exports = a


/******/},
/******/
/******/2: function(module, exports, require) {

const c = require('./c.js')

function b() {
  c()
  console.log('module b function')
}

module.exports = b


/******/},
/******/
/******/3: function(module, exports, require) {

const d = require('./d/d.js')

function c() {
  d()
  console.log('c')
}

module.exports = c


/******/},
/******/
/******/4: function(module, exports, require) {

function d() {
  console.log('d')
}

module.exports = d


/******/},
/******/
/******/})