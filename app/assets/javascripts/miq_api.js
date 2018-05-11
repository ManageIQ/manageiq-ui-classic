// the angular service is called API, and lives in the miq.api module
// the pure-JS version used to be called API as well, but given the confusion this caused in angular code, we're calling it vanillaJsAPI now

angular.module('miq.api', [])
.factory('API', ['$q', function($q) {
  var angularify = function(what) {
    return function() {
      return $q.when(what.apply(vanillaJsAPI, arguments));
    };
  };

  return {
    get: angularify(vanillaJsAPI.get),
    post: angularify(vanillaJsAPI.post),
    delete: angularify(vanillaJsAPI.delete),
    put: angularify(vanillaJsAPI.put),
    patch: angularify(vanillaJsAPI.patch),
    options: angularify(vanillaJsAPI.options),
    wait_for_task: angularify(vanillaJsAPI.wait_for_task),
    login: angularify(vanillaJsAPI.login),
    logout: vanillaJsAPI.logout,
    autorenew: vanillaJsAPI.autorenew,
  };
}]);
