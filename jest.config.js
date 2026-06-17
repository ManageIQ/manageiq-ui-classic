// jest.config.js
const resolveModule = (name) => `<rootDir>/node_modules/${name}`;

module.exports = {
  verbose: true,
  testEnvironment: 'jest-environment-jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  globals: {
    __testing__: true,
    getJSONFixture: true,
  },
  roots: ['app/javascript'],
  setupFilesAfterEnv: ['./config/jest.setup.js'],
  testRegex: '(/__tests__/.*|(\\.|_|/)(test|spec))\\.jsx?$',
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
    '^fetch-mock$': '<rootDir>/node_modules/fetch-mock/dist/cjs/index.js',
  },
};
