const merge = require('webpack-merge')

const { env, publicPath } = require('./configuration.js')
const babelrc = require('../../.babelrc.js');

let babelOptions = merge(babelrc, {
  babelrc: false,
  compact: false,
  cacheDirectory: env.BABEL_CACHE_DIR || true, // defaults to node_modules/.cache/babel-loader
});

// set WEBPACK_VERBOSE=1 to get more warnings
if (env.WEBPACK_VERBOSE) {
  // don't drop any whitespace from the bundle, prevents warnings about filesize over the limit
  delete babelOptions.compact;
}

const onlyMiq = (module) => {
  const inNodeModules = module.match(/node_modules/);
  const isMiq = module.match(/manageiq-/);

  return inNodeModules && !isMiq;
};

module.exports = [
  {
    test: /\.(js|jsx)$/,
    use: [{
      loader: 'babel-loader',
      options: babelOptions,
    }],
    exclude: onlyMiq,
    //exclude: /node_modules\/(?!manageiq-)/,
  },

  {
    test: require.resolve('bootstrap-datepicker'),
    use: 'imports-loader?exports=>undefined,define=>undefined',
  },
  {
    test: require.resolve('bootstrap-select'),
    use: 'imports-loader?module=>undefined,define=>undefined,this=>window',
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
