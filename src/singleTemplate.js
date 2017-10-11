module.exports = `/******/(function(modules) {
  /******/	const installedModules = {}
  /******/	function require(moduleId) {
  /******/		if(installedModules[moduleId]) {
  /******/       return installedModules[moduleId].exports
  /******/    }
  /******/		const module = installedModules[moduleId] = {
  /******/			exports: {}
  /******/		}
  /******/		modules[moduleId](module, module.exports, require)
  /******/		return module.exports
  /******/	}
  /******/	return require(0)
  /******/})`
