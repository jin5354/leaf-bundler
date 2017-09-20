/**
 * @file 查找模块所在绝对路径
 * @author youngwind
 * @content 我们在引用模块的时候常常是很简单的,比如用相对路径,比如直接用模块名(该模块实际上在当前文件夹的node_modules里或者在上层文件夹的node_modules里)
 *      所以,程序需要处理各种的调用方式
 */

const path = require('path')

/**
 * 根据模块的标志查找到模块的绝对路径
 * @param {string} moduleIdentifier 模块的标志,可能是模块名/相对路径/绝对路径
 * @param {string} context 上下文,入口js所在目录
 * @returns {*|Promise}
 */
module.exports = function(moduleIdentifier, context) {
  return path.resolve(context, moduleIdentifier)
}
