const fs = require('fs')
const parse = require('./parse.js')

const _resolve = require('./resolve.js')
let mid = 0 // module id
let cid = 0 // chunk id

module.exports = async function(mainModule, options) {
  let depTree = {
    modules: {}, // 用于存储各个模块对象
    chunks: {}, // 存储各个块
    mapModuleNameToId: {}, // 用于映射模块名到模块id之间的关系
    modulesById: {} // 通过模块id索引模块
  }

  depTree = await parseModule(depTree, mainModule, options, options.input)
  return depTree
}

/**
 * 分析模块
 * @param {object} depTree 模块依赖关系对象
 * @param {string} moduleName 模块名称,可能是绝对路径,也可能是相对路径,也可能是一个名字
 * @param {object} options 选项
 * @returns {*|Promise}
 */
async function parseModule(depTree, moduleName, options, filename) {
  let module
  // 查找模块
  let absoluteFileName = await _resolve(moduleName, options.context, filename)
  // 用模块的绝对路径作为模块的键值,保证唯一性

  // 去重
  if(depTree.modules[absoluteFileName]) {
    return depTree
  }

  module = depTree.modules[absoluteFileName] = {
    id: mid++,
    filename: absoluteFileName,
    name: moduleName
  }

  let source = fs.readFileSync(absoluteFileName).toString()

  let parsedModule = parse(source)

  module.requires = parsedModule.requires || []
  module.asyncs = parsedModule.asyncs || []
  module.source = parsedModule.source

  // 写入映射关系
  depTree.mapModuleNameToId[module.name] = module.id
  depTree.modulesById[module.id] = module

  // 如果此模块有依赖的模块,采取深度遍历的原则,遍历解析其依赖的模块
  let requireModules = parsedModule.requires
  if (requireModules && requireModules.length > 0) {
    for (let require of requireModules) {
      depTree = await parseModule(depTree, require.name, options, filename)
    }
    // 写入依赖模块的id,生成目标JS文件的时候会用到
    requireModules.forEach(requireItem => {
      requireItem.id = depTree.mapModuleNameToId[requireItem.name]
    })
  }

  return depTree
}
