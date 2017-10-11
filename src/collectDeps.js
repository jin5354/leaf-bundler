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

  depTree = await parseModule(depTree, mainModule, options, options.input) // 依赖收集与分析
  depTree = buildTree(depTree) // 分析 chunk 关系
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
  let absoluteFileName = await _resolve(moduleName, filename)
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

  let parsedModule = parse(source, absoluteFileName)

  module.requires = parsedModule.requires || []
  module.asyncs = parsedModule.asyncs || []
  module.source = parsedModule.source

  // 写入映射关系
  depTree.mapModuleNameToId[module.filename] = module.id
  depTree.modulesById[module.id] = module

  // 如果此模块有依赖的模块,采取深度遍历的原则,遍历解析其依赖的模块
  let requireModules = parsedModule.requires
  if (requireModules && requireModules.length > 0) {
    for (let require of requireModules) {
      depTree = await parseModule(depTree, require.name, options, absoluteFileName)
    }
    // 写入依赖模块的id,生成目标JS文件的时候会用到
    requireModules.forEach(requireItem => {
      requireItem.id = depTree.mapModuleNameToId[requireItem.filename]
    })
  }

  // 处理该模块依赖的 async 模块
  let asyncModules = parsedModule.asyncs
  if (asyncModules && asyncModules.length > 0) {
    for (let asyncModule of asyncModules) {
      let requires = asyncModule.requires
      for (let require of requires) {
        // 已经处理过的模块,不再处理
        if(depTree.mapModuleNameToId[require.name]) {continue}
        depTree = await parseModule(depTree, require.name, options, absoluteFileName)
      }
    }
  }

  return depTree
}

/**
 * 从depTree.modules中构建出depTree.chunks
 * @param {object} depTree 依赖关系对象
 * @returns {*}
 */
function buildTree(depTree) {
  addChunk(depTree, depTree.modulesById[0])

  for (let chunkId in depTree.chunks) {
    if(!depTree.chunks.hasOwnProperty(chunkId)) {continue}
    depTree = removeParentsModules(depTree, depTree.chunks[chunkId])
  }

  return depTree
}

/**
 * 新建chunk
 * @param {object} depTree
 * @returns {{id: number, modules: {}}}
 */
function addChunk(depTree, chunkStartPoint) {
  let chunk = {
    id: cid++,
    modules: {}
  }
  depTree.chunks[chunk.id] = chunk
  if (chunkStartPoint) {
    chunkStartPoint.chunkId = chunk.id //打标记
    addModuleToChunk(depTree, chunkStartPoint, chunk.id)
  }
  return chunk
}

/**
 * 将module添加到chunk中
 * @param depTree
 * @param context
 * @param chunkId
 */
function addModuleToChunk(depTree, context, chunkId) {
  context.chunks = context.chunks || []
  // context.chunks是某个module在多少个chunks出现过
  if (context.chunks.indexOf(chunkId) === -1) {
    context.chunks.push(chunkId)
    if (context.id !== undefined) {
      depTree.chunks[chunkId].modules[context.id] = 'include'
    }
    //对于 require 的依赖，纳入该 chunk
    if (context.requires) {
      context.requires.forEach(requireItem => {
        if (requireItem.filename) {
          addModuleToChunk(depTree, depTree.modulesById[depTree.mapModuleNameToId[requireItem.filename]], chunkId)
        }
      })
    }
    //对于 async 的依赖，新开 chunk
    if (context.asyncs) {
      context.asyncs.forEach(context => {
        let subChunk
        if (context.chunkId) {
          subChunk = depTree.chunks[context.chunkId]
        } else {
          subChunk = addChunk(depTree, context)
        }
        //标记一下自己的父 chunk
        subChunk.parents = subChunk.parents || []
        subChunk.parents.push(chunkId)
      })
    }
  }
}

/**
 * 将属于父级chunk的module从当前chunk移除出去，标记成 in-parent
 * @param depTree
 * @param chunk
 * @returns {*}
 */
function removeParentsModules(depTree, chunk) {
  if (!chunk.parents) {return depTree}
  for (let moduleId in chunk.modules) {
    if (!chunk.modules.hasOwnProperty(moduleId)) {continue}
    chunk.parents.forEach(parentId => {
      if (depTree.chunks[parentId].modules[moduleId]) {
        chunk.modules[moduleId] = 'in-parent'
      }
    })
  }
  return depTree
}
