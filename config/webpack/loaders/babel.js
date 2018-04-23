const { env } = require('process')

let config = {
  test: /\.js$/,
  loader: 'babel-loader',
}

if (env.WEBPACK_EXCLUDE_NODE_MODULES) {
  config.exclude = /node_modules/;
}

module.exports = config;
