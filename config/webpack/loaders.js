const merge = require('webpack-merge')
const { resolve } = require('path');

const { env, publicPath } = require('./configuration.js')
const babelrc = require('../../.babelrc.js');

// set WEBPACK_EXCLUDE_NODE_MODULES=1 to skip compiling code in node_modules
let base = {};
if (env.WEBPACK_EXCLUDE_NODE_MODULES) {
  base.exclude = /node_modules/;
} else {
  // FIXME: won't be needed with d3 4+
  base.exclude = /node_modules\/d3/;
}

let babelOptions = merge(babelrc, {
  babelrc: false,
  compact: false,
});

// set WEBPACK_VERBOSE=1 to get more warnings
if (env.WEBPACK_VERBOSE) {
  // don't drop any whitespace from the bundle, prevents warnings about filesize over the limit
  delete babelOptions.compact;
}

module.exports = [
  merge(base, {
    test: /\.(js|jsx)$/,
    use: [{
      loader: 'babel-loader',
      options: babelOptions,
    }],
  }),

  {
    test: require.resolve('bootstrap-datepicker'),
    use: 'imports-loader?exports=>undefined,define=>undefined',
  },
  {
    test: require.resolve('bootstrap-select'),
    use: 'imports-loader?module=>undefined,define=>undefined,this=>window',
  },

  {
    test: /\.(ts|tsx)$/,
    loader: 'awesome-typescript-loader',
  },

  {
    test: /\.(scss|sass|css)$/i,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          minimize: env.NODE_ENV === 'production',
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: true,
          plugins: () => [require('autoprefixer')]
        },
      },
      'resolve-url-loader',
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
          includePaths: ['bootstrap-sass', 'font-awesome-sass'].map((pkg) => resolve(__dirname, '../../node_modules', pkg, 'assets/stylesheets')),
        },
      },
    ],
  },

  {
    test: /\.(jpg|jpeg|png|gif|svg|eot|ttf|woff|woff2)$/i,
    use: [{
      loader: 'file-loader',
      options: {
        publicPath,
        name: '[name]-[hash].[ext]',
      }
    }]
  },
];
