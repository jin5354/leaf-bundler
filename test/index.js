const a = require('./a.js')
const b = require('./b.js')
const c = require('./a.js')()
const d = require('./a.js')(require('./b.js'))

a()
b()
