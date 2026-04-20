/* eslint-disable max-len */

// NOTE: ddfUrlRegex is the regex output of https://github.com/data-driven-forms/react-forms/blob/3199d495361313616901f52ba2da6a21cb3d3a50/packages/react-form-renderer/src/validators/url-validator.js#L60-L80
// Updated to require http:// or https:// protocol at the start of the string
const ddfUrlRegex = /^https?:\/\/(?:(?:\S+(?::\S*)?@)?(?:(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]?|0)\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]?|0))|(?:(?:[0-9A-Fa-f]{1,4})(?::[0-9A-Fa-f]{1,4})*::(?:[0-9A-Fa-f]{1,4})(?::[0-9A-Fa-f]{1,4})*|(?:[0-9A-Fa-f]{1,4})(?::[0-9A-Fa-f]{1,4}){7}|::1|1::)|(?![-_])(?:[-\w\u00a1-\uffff]{0,63}[^-_]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?)|localhost)(?::\d{2,5})?(?:[/][^\s?#]*)?(?:[?][^\s#]*)?(?:[#]\S*)?$/i;
// sshProtocolRegex matches SSH URLs with ssh:// protocol (supports as path separator, path is optional, supports : as port separator, port is optional)
// Examples: ssh://github.com/, ssh://github.com/user/repo.git, or ssh://github.com:port/repo.git
const sshProtocolRegex = /^ssh:\/\/(?:(?:\S+@)?(?:(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]?|0)\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]?|0)|(?:(?:[0-9A-Fa-f]{1,4})(?::[0-9A-Fa-f]{1,4})*::(?:[0-9A-Fa-f]{1,4})(?::[0-9A-Fa-f]{1,4})*|(?:[0-9A-Fa-f]{1,4})(?::[0-9A-Fa-f]{1,4}){7}|::1|1::)|(?![-_])(?:[-\w\u00a1-\uffff]{0,63}[^-_]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?)|localhost)(?::(\d{2,5}))?(?:\/[^\s?#:]*)?(?:[?][^\s#]*)?(?:[#]\S*)?)$/i;
// sshRegex matches SSH URLs with user@host:path format (requires @ and : to distinguish from plain domains)
const sshRegex = /^(?:(?:\S+@)(?:(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]?|0)\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]?|0)|(?:(?:[0-9A-Fa-f]{1,4})(?::[0-9A-Fa-f]{1,4})*::(?:[0-9A-Fa-f]{1,4})(?::[0-9A-Fa-f]{1,4})*|(?:[0-9A-Fa-f]{1,4})(?::[0-9A-Fa-f]{1,4}){7}|::1|1::)|(?![-_])(?:[-\w\u00a1-\uffff]{0,63}[^-_]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?)|localhost):(?:[^\s?#]+))$/i;

export const customUrlValidator = (urlString) => {
  // TODO: not repeat the ddf url validation code (or have it hardcoded (?))
  // https://data-driven-forms.org/schema/custom-validator

  let isValid = false;
  // the ddf schema validators dont allow matching with OR, only for AND, hence we use a custom validator here
  if (urlString && (urlString.match(sshRegex) || urlString.match(sshProtocolRegex) || urlString.match(ddfUrlRegex))) {
    isValid = true;
  }

  // In development mode, allow file:// URLs for local testing
  if (!isValid && urlString && process.env.NODE_ENV === 'development' && urlString.startsWith('file://')) {
    isValid = true;
  }

  return isValid;
};

export const validationString = () => {
  let validationString = __(`URL must include a protocol (http:// or https://) with path or be a valid SSH path (user@server:path or ssh://user@address:port/path)`);

  if (process.env.NODE_ENV === 'development') {
    validationString = __(`URL must include a protocol (http://, https:// or file://) with path or be a valid SSH path (user@server:path or ssh://user@address:port/path)`);
  }
  return validationString;
};
