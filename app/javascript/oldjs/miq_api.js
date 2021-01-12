// the angular service is called $API, and lives in the miq.api module
// the pure-JS/react version is called API, and lives on window

// the old pair of vanillaJsAPI for vanilla and API for angular will still work but should be considered deprecated

(function() {
  var angularAPI = ['$q', function($q) {
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
    };
  }];

  angular.module('miq.api', [])
    .factory('API', angularAPI)
    .factory('$API', angularAPI);
})();
