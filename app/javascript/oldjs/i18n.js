$(function() {
  // set in layouts/i18n_js
  if (typeof (ManageIQ.i18n.mark_translated_strings) !== 'undefined' && ManageIQ.i18n.mark_translated_strings) {
    window.__ = function() {
      return '\u00BB' + i18n.gettext.apply(i18n, arguments) + '\u00AB';
    };
    window.n__ = function() {
      return '\u00BB' + i18n.ngettext.apply(i18n, arguments) + '\u00AB';
    };
  }
});
