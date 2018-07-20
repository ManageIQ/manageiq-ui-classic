// gettextCatalog
//
// This is to override angular-gettext's standard gettextCatalog so that
// the angular-gettext directive use our __ and n__ (and our i18n catalogs)
// instead of the native mechanism of gettextCatalog.

angular.module('gettext').factory('gettextCatalog', function() {
  return {
    getString: __,
    getPlural: n__,
  };
});
