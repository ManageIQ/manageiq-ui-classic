// note that every package mentioned here has to be explicitly required (require/import, not a string name)
// if not, this fails if babel runs in a plugin repo before it manages to load them

const browsers = require('./package.json').browserslist;

module.exports = {
  presets: [
    [
      require('@babel/preset-env').default,
      {
        bugfixes: true,
        corejs: 3,
        targets: { browsers },
        useBuiltIns: 'entry',
      },
    ],
    require('@babel/preset-react').default,
  ],
  plugins: [
    require('@babel/plugin-proposal-class-properties').default,
  ],
};
