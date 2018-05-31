module.exports = {
  test: /\.(js|jsx)$/,
  loader: 'babel-loader',
  query: {
    presets: ['react'],
  },
}
