// Note: You must restart bin/webpack-dev-server for changes to take effect

const merge = require('webpack-merge')
const sharedConfig = require('./shared.js')
const { settings, output } = require('./configuration.js')
const { env } = require('process')

module.exports = merge(sharedConfig, {
  mode: 'development',
  devtool: 'inline-source-map',

  devServer: {
    clientLogLevel: 'none',
    https: settings.dev_server && settings.dev_server.https,
    host: settings.dev_server && settings.dev_server.host,
    port: settings.dev_server && settings.dev_server.port,
    contentBase: output.path,
    publicPath: output.publicPath,
    compress: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    historyApiFallback: true,
    watchOptions: {
      ignored: /node_modules/
    },
    proxy: {
      '/': {
        target: `http://${settings.dev_server.host}:${env.PORT || '3000'}`,
        secure: false,
      },
      '/ws': {
        target: `ws://${settings.dev_server.host}:${env.WS_PORT || env.PORT || '3000'}`,
        secure: false,
        ws: true,
      },
    }
  }
})
