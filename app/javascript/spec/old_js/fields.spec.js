require('../helpers/old_js_file_require_helper.js');

describe('Pass fields  to server', () => {
  it('returns url fields in name/value pairs', () => {
    var url = '/path/to/infinity';
    var args = {'foo': 'bar', 'lorem': 'ipsum'};
    expect(miqPassFields(url, args)).toEqual('/path/to/infinity?foo=bar&lorem=ipsum');
  });
});
