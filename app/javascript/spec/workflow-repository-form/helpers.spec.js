import { customUrlValidator } from '../../components/workflow-repository-form/helpers';

const TESTCASES = [ // Example Cases
  ['git@github.com:ManageIQ/foo-parse.git', true],
  ['https://github.com/ManageIQ/foo-parse.git', true],
  ['ssh://github.com/ManageIQ/foo-parse.git', true],
  ['ssh://github.com/', true],
  ['file:///opt/repos/ManageIQ/foo-parse.git', true],
  ['https://github.com/ManageIQ/foo/blob/master/test/index.js', true],
  ['hello', false],
  ['manageiq/fooparse', false],
  ['', false],
];

describe('Helpers', () => {
  TESTCASES.forEach((test) => {
    it(`customUrlValidator ${test[0]}`, () => {
      expect(customUrlValidator(test[0])).toEqual(test[1]);
    });
  });
});
