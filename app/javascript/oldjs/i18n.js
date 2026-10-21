/* eslint-disable no-undef, import/extensions, prefer-spread, prefer-rest-params, prefer-arrow-callback, prefer-template */
const Jed = require('jed');
require('./miq_global.js');

(function() {
  const locales = window.locales || {};
  let locale = document.getElementsByTagName('html')[0].lang;

  if (!locale) {
    // eslint-disable-next-line no-console
    console.warn('No locale found as an html attribute, using default.');
    return;
  }

  locale = locale.replace(/-/g, '_');

  const i18n = new Jed(locales[locale] || {});

  window.__ = function() {
    return i18n.gettext.apply(i18n, arguments);
  };

  window.n__ = function() {
    return i18n.ngettext.apply(i18n, arguments);
  };

  window.s__ = function(key) {
    return window.__(key).split('|').pop();
  };

  window.gettext = window.__;
  window.ngettext = window.n__;
  window.sgettext = window.s__;

  window.i18n = i18n;
}());

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
