// note that every package mentioned here has to be explicitly required (require/import, not a string name)
// if not, this fails if babel runs in a plugin repo before it manages to load them

module.exports = {
  presets: [
    [
      require('@babel/preset-env'),
      {
        targets: {
          browsers: [
            "> 3%",
            "last 2 versions",
            "Firefox ESR",
          ],
        },
      },
    ],
    require('@babel/preset-react'),
  ],
  plugins: [
    require('@babel/plugin-proposal-class-properties'),
    require('@babel/plugin-proposal-export-default-from'),
    require('@babel/plugin-proposal-export-namespace-from'),
    require('@babel/plugin-proposal-object-rest-spread'),
    require('@babel/plugin-transform-object-assign'),
  ],
};
