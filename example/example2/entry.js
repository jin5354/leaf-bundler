const a = require('./a.js')
const e = require('./d/e.js')
a()
e()

require.ensure(['./b.js'], () => {
  const b = require('./b.js')
  b()
})

