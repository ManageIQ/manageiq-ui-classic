import { customUrlValidator } from '../../components/ansible-repository-form/helpers';

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
  for (const test of TESTCASES) {
    it('customUrlValidator '+ test[0] , () => {
      expect(customUrlValidator(test[0])).toEqual(test[1]);
    });
  }
});
