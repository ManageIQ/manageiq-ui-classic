// this is for compatibility with angular-translate used in Service UI
// we currently don't support extracting such strings in ui-classic
// hence miq.compat, so that it needs to be explicitly required when needed

angular.module('miq.compat', [])
  .filter('translate', function() {
    return function(val) {
      return __(val);
    };
  });
