// https://facebook.github.io/jest/docs/en/configuration.html

module.exports = {
  verbose: true,
  globals: {
    __testing__: true
  },
  roots: ['<rootDir>/app/javascript'],
  setupFiles: ['<rootDir>/config/jest/setup-env'],
  setupTestFrameworkScriptFile: '<rootDir>/config/jest/setup-framework',
  testRegex: '(/__tests__/.*|(\\.|_|/)(test|spec))\\.(jsx?|tsx?)$',
  transform: {
    '^.+\\.js$': 'babel-jest',
    '.(ts|tsx)': 'ts-jest'
  },
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx'
  ]
};
