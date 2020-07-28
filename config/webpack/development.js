// Note: You must restart bin/webpack-dev-server for changes to take effect

const merge = require('webpack-merge')
const sharedConfig = require('./shared.js')
const { settings, output } = require('./configuration.js')
const { env } = require('process')

const {
  https = false,
  host = '0.0.0.0',
  port = '8080',
} = settings.dev_server || {};

module.exports = merge(sharedConfig, {
  mode: 'development',
  devtool: 'inline-source-map',

  devServer: {
    clientLogLevel: 'none',
    https,
    host,
    port,
    contentBase: output.path,
    publicPath: output.publicPath,
    compress: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    historyApiFallback: true,
    watchOptions: {
      ignored: /node_modules/,
    },
    proxy: {
      '/': {
        target: `http://${host}:${env.PORT || '3000'}`,
        secure: false,
      },
      '/ws': {
        target: `ws://${host}:${env.WS_PORT || env.PORT || '3000'}`,
        secure: false,
        ws: true,
      },
    },
  },
});
