// Note: You must restart bin/webpack-dev-server for changes to take effect

/* eslint global-require: 0 */
/* eslint import/no-dynamic-require: 0 */

const webpack = require('webpack')
const merge = require('webpack-merge')
const { basename, dirname, join, relative, resolve } = require('path')
const { sync } = require('glob')
const ManifestPlugin = require('webpack-manifest-plugin')
const extname = require('path-complete-extname')
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const { SplitChunksPlugin } = require('webpack').optimize;

const { env, settings, output, engines } = require('./configuration.js')
const loaders = require('./loaders.js')
const RailsEnginesPlugin = require('./RailsEnginesPlugin')

const extensionGlob = `**/*{${settings.extensions.join(',')}}*` // */
const entryPath = join(settings.source_path, settings.source_entry_path)
const moduleDir = engines['manageiq-ui-classic'].node_modules

const sharedPackages = [
  'jquery',
  'lodash',
  'patternfly-react',
  'patternfly-sass',
  'react',
  'react-dom',
  'prop-types',
  'graphql', // TODO remove once this gets added in manageiq-graphql
];

let packPaths = {}

Object.keys(engines).forEach(function(k) {
  let root = engines[k].root
  let glob = join(root, entryPath, extensionGlob)
  packPaths[k] = sync(glob)
})

const nodeModulesNotShims = (module) => {
  const inNodeModules = SplitChunksPlugin.checkTest(/node_modules/, module);
  const inShims = SplitChunksPlugin.checkTest(/shims/, module);

  return inNodeModules && ! inShims;
};
const notShims = (module) => (! SplitChunksPlugin.checkTest(/shims/, module));

module.exports = {
  entry: {
    ...Object.keys(packPaths).reduce(
      (map, pluginName) => {
        packPaths[pluginName].forEach(function(entry) {
          map[join(pluginName, basename(entry, extname(entry)))] = resolve(entry)
        })
        return map
      }, {}
    ),
    'shims': [
      'es6-shim',
      'array-includes',
      'whatwg-fetch',
      'babel-polyfill',
    ],
  },

  output: {
    filename: '[name]-[chunkhash].js',
    path: output.path,
    publicPath: output.publicPath
  },

  module: {
    rules: loaders,
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || 'development'),
    }),

    // Workaround for graphql/graphql-language-service#128
    new webpack.ContextReplacementPlugin(
      /graphql-language-service-interface[\\\/]dist$/,
      /\.js$/
    ),

    new ManifestPlugin({
      publicPath: output.publicPath,
      writeToFileEmit: true,
    }),

    new DuplicatePackageCheckerPlugin({
      verbose: true,
      showHelp: false,
    }),
  ],

  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      minChunks: 1,
      minSize: 0,
      cacheGroups: {
        vendor: {
          chunks: 'all',
          name: 'vendor',
          priority: -10,
          reuseExistingChunk: true,
          test: nodeModulesNotShims,
        },
        default: {
          chunks: 'all',
          minChunks: 2,
          name: 'vendor',
          priority: -20,
          reuseExistingChunk: true,
          test: notShims,
        },
      },
    },
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, '../../', 'app/javascript'),
      'react': resolve(__dirname, '../../', 'node_modules', 'react'),
    },
    extensions: settings.extensions,
    modules: [],
    plugins: [
      new RailsEnginesPlugin('module', 'resolve', engines, { packages: sharedPackages, root: moduleDir }),
    ],
  },

  resolveLoader: {
    // only read loaders from ui-classic
    modules: [moduleDir],
  },
}
