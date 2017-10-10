const a = require('./a.js')
a()

require.ensure(['./b.js'], () => {
  const b = require('./b.js')
  b()
})

