// Note: You must restart bin/webpack-dev-server for changes to take effect

/* eslint global-require: 0 */

const { env } = require('process')

if (env.CYPRESS_DEV) {
  module.exports = require('./development.js')
} else {
  module.exports = require('./production.js')
}
