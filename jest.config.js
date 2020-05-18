// jest.config.js
const resolveModule = (name) => `<rootDir>/node_modules/${name}`;

module.exports = {
  verbose: true,
  globals: {
    __testing__: true,
    getJSONFixture: true,
  },
  roots: ['app/javascript'],
  setupFiles: ['./config/jest.setup.js'],
  testRegex: '(/__tests__/.*|(\\.|_|/)(test|spec))\\.jsx?$',
  testURL: 'http://localhost',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
  ],
  moduleNameMapper: {
    "\\.(css|scss)$": 'identity-obj-proxy',
    '^react$': '<rootDir>/node_modules/react/',
    '^moment$': resolveModule('moment'), // fix moment-strftime peerDependency issue
    '@@ddf': '<rootDir>/app/javascript/forms/data-driven-form',
  },
};
