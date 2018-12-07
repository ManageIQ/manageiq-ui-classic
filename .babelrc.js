// note that every package mentioned here has to be explicitly required (require/import, not a string name)
// if not, this fails if babel runs in a plugin repo before it manages to load them

module.exports = {
  presets: [
    [
      require('babel-preset-env'),
      {
        targets: {
          browsers: [
            "> 1%",
            "last 2 versions",
            "Firefox ESR",
            "IE 11",
          ],
        },
      },
    ],
    require('babel-preset-react'),
    require('babel-preset-es2015'),
  ],
  plugins: [
    require('babel-plugin-transform-class-properties'),
    require('babel-plugin-transform-export-extensions'),
    require('babel-plugin-transform-object-rest-spread'),
    require('babel-plugin-transform-object-assign'),
  ],
};
