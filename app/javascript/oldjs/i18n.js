require('./locale/');
require('gettext_i18n_rails_js/vendor/assets/javascripts/gettext/jed.js');
require('gettext_i18n_rails_js/lib/assets/javascripts/gettext/all.js');

$(function() {
  // set in layouts/i18n_js
  if (ManageIQ && ManageIQ.i18n && ManageIQ.i18n.mark_translated_strings) {
    window.__ = function() {
      return '\u00BB' + i18n.gettext.apply(i18n, arguments) + '\u00AB';
    };
    window.n__ = function() {
      return '\u00BB' + i18n.ngettext.apply(i18n, arguments) + '\u00AB';
    };
  }
});
