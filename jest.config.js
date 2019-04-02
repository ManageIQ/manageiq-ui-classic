// jest.config.js
module.exports = {
  verbose: true,
  globals: {
    __testing__: true,
    getJSONFixture: true,
  },
  roots: ['app/javascript'],
  setupFiles: ['./config/jest.setup.js'],
  testRegex: '(/__tests__/.*|(\\.|_|/)(test|spec))\\.(jsx?|tsx?)$',
  testURL: 'http://localhost',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '.(ts|tsx)': 'ts-jest'
  },
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx'
  ],
};
