const merge = require('webpack-merge')

const { env, publicPath } = require('./configuration.js')
const babelrc = require('../../.babelrc.js');

// set WEBPACK_EXCLUDE_NODE_MODULES=1 to skip compiling code in node_modules
let base = {};
if (env.WEBPACK_EXCLUDE_NODE_MODULES) {
  base.exclude = /node_modules/;
}

module.exports = [
  merge(base, {
    test: /\.(mjs|js|jsx)$/,
    use: [{
      loader: 'babel-loader',
      options: merge(babelrc, {
        babelrc: false,
      }),
    }],
  }),

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
        },
      },
      'resolve-url-loader',
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
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
        name: env.NODE_ENV === 'production' ? '[name]-[hash].[ext]' : '[name].[ext]'
      }
    }]
  },
];
