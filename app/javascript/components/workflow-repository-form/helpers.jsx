/* eslint-disable max-len */

// NOTE: ddfUrlRegex is the regex output of https://github.com/data-driven-forms/react-forms/blob/3199d495361313616901f52ba2da6a21cb3d3a50/packages/react-form-renderer/src/validators/url-validator.js#L60-L80
const ddfUrlRegex = /^((([-a-zA-Z0-9%._+~#=])@)(([-a-zA-Z0-9%._+~#=])(?:(?:).)*))|((?:\S+(?::\S*)?@)?)(?:((?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]?|0)\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]?|0))|(((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7}|::1|1::)|((?![-_])(?:[-\w\u00a1-\uffff]{0,63}[^-_]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))|(localhost))((?::\d{2,5})?)((?:[/][^\s?#]*)?)((?:[?][^\s#]*)?)((?:[#]\S*)?)$/i;
// sshRegex is essentially the same as ddfUrlRegex but we've removed the protocol and modified PATH to have a colon instead of a slash
const sshRegex = /^(?:\S+(?::\S*)?@)?(?:(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]?|0)\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]?|0)|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7}|::1|1::|(?![-_])(?:[-\w\u00a1-\uffff]{0,63}[^-_]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?)|localhost)(?::\d{2,5})?(?:[:][^\s?#]*)?(?:[?][^\s#]*)?(?:[#]\S*)?$/i;

export const customUrlValidator = (urlString) => {
  // TODO: not repeat the ddf url validation code (or have it hardcoded (?))
  // https://data-driven-forms.org/schema/custom-validator

  let isValid = false;
  // the ddf schema validators dont allow matching with OR, only for AND, hence we use a custom validator here
  if (urlString && (urlString.match(sshRegex) || urlString.match(ddfUrlRegex))) {
    isValid = true;
  }
  return isValid;
};
