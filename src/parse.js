/**
 * @content 使用esprima将模块文件解析成AST,然后逐个语句遍历,找到该模块都依赖了哪些模块
 */

const esprima = require('esprima')
const resolve = require('./resolve.js')

function parse(source, path) {
  let ast = esprima.parse(source, {
    range: true
  })
  let module = {}
  walkStatements(module, ast.body, path)
  module.source = source
  return module
}

function walkStatements(module, astTree, path) {
  astTree.forEach(statement => {
    walkStatement(module, statement, path)
  })
}

/**
 * 分析每一个语句
 * @param {object} module  模块对象
 * @param  {object} statement AST语法树
 */
function walkStatement(module, statement, path) {
  switch (statement.type) {
    case 'BlockStatement':
      walkStatements(module, statement.body, path)
      break
    case 'VariableDeclaration':
      if (statement.declarations) {
        walkVariableDeclarators(module, statement.declarations, path)
      }
      break
    case 'ExpressionStatement':
      walkExpression(module, statement.expression, path)
      break
  }
}

/**
 * 处理定义变量的语句
 * @param {object} module  模块对象
 * @param {object} declarator
 */
function walkVariableDeclarators(module, declarators, path) {
  declarators.forEach(declarator => {
    if(declarator.type === 'VariableDeclarator' && declarator.init) {
      walkExpression(module, declarator.init, path)
    }
  })
}

/**
 * 处理表达式
 * @param {object} module  模块对象
 * @param {object} expression 表达式
 */
function walkExpression(module, expression, path) {
  switch (expression.type) {
    case 'CallExpression':
      // 处理普通的require
      if (expression.callee && expression.callee.name === 'require' && expression.callee.type === 'Identifier' &&
              expression.arguments && expression.arguments.length === 1) {
        module.requires = module.requires || []
        let param = Array.from(expression.arguments)[0]
        module.requires.push({
          name: param.value,
          filename: resolve(param.value, path),
          nameRange: param.range
        })
      }

      // 处理匿名表达式,如 require('b')()
      if (expression.callee && !expression.callee.name) {
        walkExpression(module, expression.callee, path)

        // 处理连续调用的匿名表达式,如 require('a')(require('b'));
        if(expression.arguments && expression.arguments[0] && expression.arguments[0].type === 'CallExpression') {
          walkExpressions(module, expression.arguments, path)
        }
      }

      break
    case 'FunctionExpression':
      if (expression.body.type === 'BlockStatement') {
        walkStatement(module, expression.body, path)
      }
  }
}

function walkExpressions(module, expressions, path) {
  expressions.forEach(expression => {
    walkExpression(module, expression, path)
  })
}

module.exports = parse
