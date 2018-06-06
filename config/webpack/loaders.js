const ExtractTextPlugin = require('extract-text-webpack-plugin')
const { env, publicPath } = require('./configuration.js')


module.exports = [
  {
    test: /\.(js|jsx)$/,
    loader: 'babel-loader',
    query: {
      presets: ['react'],
    },
  },

  {
    test: /\.(scss|sass|css)$/i,
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        { loader: 'css-loader', options: { minimize: env.NODE_ENV === 'production' } },
        { loader: 'postcss-loader', options: { sourceMap: true } },
        'resolve-url-loader',
        { loader: 'sass-loader', options: { sourceMap: true } }
      ]
    })
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
