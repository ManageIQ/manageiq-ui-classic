import { urlValidation } from '../../components/ansible-repository-form/helpers';

const TESTCASES = [ // Example Cases
  [{ scm_url: 'git@github.com:IonicaBizau/node-git-url-parse.git' }, true],
  [{ scm_url: 'https://github.com/IonicaBizau/node-git-url-parse.git' }, true],
  [{ scm_url: 'ssh://github.com/IonicaBizau/node-git-url-parse.git' }, true],
  [{ scm_url: 'file:///opt/repos/IonicaBizau/node-git-url-parse.git' }, true],
  [{ scm_url: 'https://github.com/IonicaBizau/git-url-parse/blob/master/test/index.js' }, true],
  [{ scm_url: '' }, false],
  [{}, false],
  [{ scm_url: 'sche$$$***' }, true],
  [{ scm_url: '%%' }, false],
  [{ scm_url: 'scheme://\%\%@host' }, false],

  // url scheme
  [{ scm_url: '_' }, true],
  [{ scm_url: 'scheme' }, true],
  [{ scm_url: 'scheme:' }, false],
  [{ scm_url: 'scheme:/' }, false],
  [{ scm_url: 'scheme://' }, false],
  [{ scm_url: 'file' }, true],
  [{ scm_url: 'file:' }, false],
  [{ scm_url: 'file:/' }, false],
  [{ scm_url: 'file://' }, true],
  [{ scm_url: '://acme.co' }, true],
  [{ scm_url: 'x_test://acme.co' }, false],
  [{ scm_url: '-test://acme.co' }, false],
  [{ scm_url: '0test://acme.co' }, false],
  [{ scm_url: '+test://acme.co' }, false],
  [{ scm_url: '.test://acme.co' }, false],
  [{ scm_url: 'schem%6e://' }, false],
  [{ scm_url: 'x-Test+v1.0://acme.co' }, false],

  // url authority
  [{ scm_url: 'scheme://user:pass@' }, false],
  [{ scm_url: 'scheme://?' }, false],
  [{ scm_url: 'scheme://#' }, false],
  [{ scm_url: 'scheme:///' }, false],
  [{ scm_url: 'scheme://:' }, false],
  [{ scm_url: 'scheme://:555' }, false],
  [{ scm_url: 'file://user:pass@' }, true],
  [{ scm_url: 'file://?' }, true],
  [{ scm_url: 'file://#' }, true],
  [{ scm_url: 'file:///' }, true],
  [{ scm_url: 'file://:' }, false],
  [{ scm_url: 'file://:555' }, false],
  [{ scm_url: 'scheme://user:pass@host' }, false],

  // url authority
  [{ scm_url: 'scheme://@host' }, false],
  [{ scm_url: 'scheme://%00@host' }, false],
  [{ scm_url: 'scheme://%%@host' }, false],
  [{ scm_url: 'scheme://host_' }, false],
  [{ scm_url: 'scheme://user:pass@host/' }, false],
  [{ scm_url: 'scheme://@host/' }, false],
  [{ scm_url: 'scheme://host/' }, false],
  [{ scm_url: 'scheme://host?x' }, false],
  [{ scm_url: 'scheme://host#x' }, false],
  [{ scm_url: 'scheme://host/@' }, false],
  [{ scm_url: 'scheme://host?@x' }, false],
  [{ scm_url: 'scheme://host#@x' }, false],
  [{ scm_url: 'scheme://[::1]' }, false],
  [{ scm_url: 'scheme://[::1]/' }, false],
  [{ scm_url: 'scheme://hos%41/' }, false],
  [{ scm_url: 'scheme://[invalid....:/' }, false],
  [{ scm_url: 'scheme://invalid....:]/' }, false],
  [{ scm_url: 'scheme://invalid....:[/' }, false],
  [{ scm_url: 'scheme://invalid....:[' }, false],
];

describe('Helpers', () => {
  it('urlValidation', () => {
    for (const test of TESTCASES) {
      let expectation = {};
      if (test[1]) {
        expectation = {};
      } else {
        expectation = { scm_url: __('URL must include a protocol (http://, https:// or file://) with path or be a valid SSH path (user@server:path or ssh://user@address:port/path)') };
      }
      expect(urlValidation(test[0])).toEqual(expectation);
    }
  });
});
