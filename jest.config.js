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
  // TODO: Try removing this and use babel-jest itself once Jest moves to Babel v8
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        rootDir: '.',
      },
    }],
    '^.+\\.jsx?$': 'babel-jest',
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
    '^moment$': resolveModule('moment'), // fix moment-strftime peerDependency issue
    '@@ddf': '<rootDir>/app/javascript/forms/data-driven-form',
    '^fetch-mock$': '<rootDir>/node_modules/fetch-mock/dist/cjs/index.js',
    '^react-markdown$': '<rootDir>/node_modules/react-markdown/react-markdown.min.js',
    '^temporal-polyfill/global$': '<rootDir>/node_modules/temporal-polyfill/global.js', // Jest's CJS transform can't handle ESM
  },
};
