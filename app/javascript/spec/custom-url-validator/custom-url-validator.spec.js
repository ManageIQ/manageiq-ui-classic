import { customUrlValidator } from '../../components/workflow-repository-form/helpers';

const TESTCASES = [
  ['git@github.com:ManageIQ/foo-parse.git', true],
  ['https://github.com/ManageIQ/foo-parse.git', true],
  ['ssh://github.com/ManageIQ/foo-parse.git', true],
  ['ssh://github.com:ManageIQ/foo-parse.git', true],
  ['ssh://github.com/', true],
  ['https://github.com/ManageIQ/foo/blob/master/test/index.js', true],
  ['hello', false],
  ['manageiq/fooparse', false],
  ['', false],
];

describe('Helpers', () => {
  const ORIG_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIG_ENV };
  });

  afterEach(() => {
    process.env = ORIG_ENV;
  });

  TESTCASES.forEach((test) => {
    it(`customUrlValidator ${test[0]}`, () => {
      expect(customUrlValidator(test[0])).toEqual(test[1]);
    });
  });

  it('tests development mode', () => {
    process.env.NODE_ENV = 'development';
    expect(customUrlValidator('file:///opt/repos/ManageIQ/foo-parse.git')).toEqual(true);
  });

  it('tests production mode', () => {
    process.env.NODE_ENV = 'production';
    expect(customUrlValidator('file:///opt/repos/ManageIQ/foo-parse.git')).toEqual(false);
  });
});
