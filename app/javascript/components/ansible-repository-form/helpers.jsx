const GitUrlParse = require('git-url-parse');

export const urlValidation = (values) => {
  const errors = {};
  var error = false;
  try {
    const parsed = values.scm_url ? GitUrlParse(values.scm_url) : {};
    if ((parsed.protocol !== 'http'
          && parsed.protocol !== 'https'
          && parsed.protocol !== 'file'
          && parsed.protocol !== 'ssh')
          || parsed.pathname === '') {
      error = true;
    }
    if (parsed.protocols.length > 2 || (parsed.protocols.length === 1 &&  parsed.protocols[0] !== parsed.protocol)) {
      error = true;
    }
  } catch (err) {
    error = true;
  }
  if (error) {
    errors.scm_url = __('URL must include a protocol (http://, https:// or file://) with path or be a valid SSH path (user@server:path or ssh://user@address:port/path)');
  }
  return errors;
};
