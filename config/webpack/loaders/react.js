const { env } = require('process')

let config = {
  test: /\.(js|jsx)$/,
  loader: 'babel-loader',
  query: {
    presets: ['react'],
  },
}

if (env.WEBPACK_EXCLUDE_NODE_MODULES) {
  config.exclude = /node_modules/;
}

module.exports = config;
