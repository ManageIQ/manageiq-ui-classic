// jest.config.js
const { existsSync } = require('fs');
const { join, resolve } = require('path');

const resolveModule = (name) => `<rootDir>/node_modules/${name}`;

// Plugin (engine) javascript directories, taken from the same paths.json that webpack uses
const pluginRoots = (() => {
  try {
    const { engines } = require('./config/webpack/paths.json');
    return Object.values(engines)
      .map(({ root }) => join(root, 'app/javascript'))
      .filter((dir) => resolve(dir) !== resolve(__dirname, 'app/javascript') && existsSync(dir));
  } catch (_e) {
    return [];
  }
})();

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
  roots: ['app/javascript', ...pluginRoots],
  // Plugins have no node_modules of their own, so resolve packages from ui-classic
  modulePaths: ['<rootDir>/node_modules'],
  setupFilesAfterEnv: ['./config/jest.setup.js'],
  testRegex: '(/__tests__/.*|(\\.|_|/)(test|spec))\\.jsx?$',
  // TODO: Try removing this and use babel-jest itself once Jest moves to Babel v8
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        rootDir: '.',
      },
    }],
    // Explicit configFile so that plugin files outside this repo are also transpiled with .babelrc.js
    '^.+\\.jsx?$': ['babel-jest', { configFile: resolve(__dirname, '.babelrc.js') }],
  },
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'ts',
    'tsx'
  ],
  moduleNameMapper: {
    "\\.(css|scss)$": 'identity-obj-proxy',
    '^react$': '<rootDir>/node_modules/react/',
    '^angular-mocks$': resolveModule('angular/angular-mocks.js'), // bundled in @brickhouse-tech/angular-lts
    '^moment$': resolveModule('moment'), // fix moment-strftime peerDependency issue
    '@@ddf': '<rootDir>/app/javascript/forms/data-driven-form',
    '^@@miq-redux/(.*)$': '<rootDir>/app/javascript/redux/$1',
    '^react-markdown$': '<rootDir>/node_modules/react-markdown/react-markdown.min.js',
    '^temporal-polyfill/global$': '<rootDir>/node_modules/temporal-polyfill/global.js', // Jest's CJS transform can't handle ESM
  },
};
