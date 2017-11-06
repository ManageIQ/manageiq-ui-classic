// Note: You must restart bin/webpack-dev-server for changes to take effect

/* eslint global-require: 0 */
/* eslint import/no-dynamic-require: 0 */

const webpack = require('webpack')
const merge = require('webpack-merge')
const { basename, dirname, join, relative, resolve } = require('path')
const { sync } = require('glob')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const extname = require('path-complete-extname')
const { env, settings, output, loadersDir, engines } = require('./configuration.js')

const extensionGlob = `**/*{${settings.extensions.join(',')}}*` // */
const entryPath = join(settings.source_path, settings.source_entry_path)
let packPaths = {}

Object.keys(engines).forEach(function(k) {
  let root = engines[k]
  let glob = join(root, entryPath, extensionGlob)
  packPaths[k] = sync(glob)
})

module.exports = {
  entry: Object.keys(packPaths).reduce(
    (map, pluginName) => {
      packPaths[pluginName].forEach(function(entry) {
        map[join(pluginName, basename(entry, extname(entry)))] = resolve(entry)
      })
      return map
    }, {}
  ),

  output: {
    filename: '[name].js',
    path: output.path,
    publicPath: output.publicPath
  },

  module: {
    rules: sync(join(loadersDir, '*.js')).map(loader => require(loader))
  },

  plugins: [
    new webpack.EnvironmentPlugin(JSON.parse(JSON.stringify(env))),
    new ExtractTextPlugin(env.NODE_ENV === 'production' ? '[name]-[hash].css' : '[name].css'),

    // Workaround for angular/angular#11580
    new webpack.ContextReplacementPlugin(
      // The (\\|\/) piece accounts for path separators in *nix and Windows
      /angular(\\|\/)core(\\|\/)@angular/,
      resolve(__dirname, '../../'), // location of your src
      {} // a map of your routes
    ),

    new ManifestPlugin({
      publicPath: output.publicPath,
      writeToFileEmit: true,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
    }),
  ],

  resolve: {
    extensions: settings.extensions,
    modules: [resolve(settings.source_path)].concat(
      Object.values(engines).map(engine => `${engine}/node_modules`)
    ),
  },

  resolveLoader: {
    modules: ['node_modules']
  }
}
