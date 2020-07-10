// Note: You must restart bin/webpack-dev-server for changes to take effect

/* eslint global-require: 0 */

const merge = require('webpack-merge');
const CompressionPlugin = require('compression-webpack-plugin');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const sharedConfig = require('./shared.js');

module.exports = merge(sharedConfig, {
  mode: 'production',
  devtool: 'source-map',
  stats: 'normal',

  plugins: [
    new CompressionPlugin({
      test: /\.(js|css|html|json|ico|svg|eot|otf|ttf)$/,
    }),

    // Write out dependencies list for audit purposes
    new StatsWriterPlugin({
      filename: "webpack-modules-manifest.json",
      fields: ["modules"],

      transform(data) {
        // recursively flatten nested modules
        const transformModule  = m  => m.modules ? transformModules(m.modules) : m.name;
        const transformModules = ms => ms.flatMap(m => transformModule(m));

        var modules = transformModules(data.modules).sort();
        modules = [...new Set(modules)]; // uniq
        return JSON.stringify(modules, null, 2);
      }
    })
  ],
});
