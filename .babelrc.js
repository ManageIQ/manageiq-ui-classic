// note that every package mentioned here has to be explicitly required (require/import, not a string name)
// if not, this fails if babel runs in a plugin repo before it manages to load them

module.exports = {
  presets: [
    [
      require('@babel/preset-env').default,
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
    require('@babel/preset-react').default,
  ],
  plugins: [
    require('@babel/plugin-proposal-class-properties').default,
    require('@babel/plugin-proposal-export-default-from').default,
    require('@babel/plugin-proposal-export-namespace-from').default,
    require('@babel/plugin-proposal-object-rest-spread').default,
    require('@babel/plugin-transform-object-assign').default,
  ],
};
