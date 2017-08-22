/* functions to use the API from our JS/Angular:
 *
 * API.get(url, options) - use API.get('/api'), returns a Promise
 * API.delete - (the same)
 * API.post(url, data, options) - returns Promise
 * API.put - (the same)
 * API.patch - (the same)
 * API.options - (the same)
 * API.login(login, password) - performs initial authentication, saves token on success, returns Promise
 * API.logout() - clears login info, no return
 * API.autorenew() - registers a 60second interval to query /api, returns a function to clear the interval
 *
 * the API token is persisted into sessionStorage
 *
 * the angular service is called API, and lives in the miq.api module
 * the pure-JS version used to be called API as well, but given the confusion this caused in angular code, we're calling it vanillaJsAPI now
 *
 */

(function() {
  function API() {
  }

  API.get = function(url, options) {
    return fetch(url, _.extend({
      method: 'GET',
    }, process_options(options)))
    .then(process_response);
  };

  API.options = function(url, options) {
    return fetch(url, _.extend({
      method: 'OPTIONS',
    }, process_options(options)))
    .then(process_response);
  };

  API.post = function(url, data, options) {
    return fetch(url, _.extend({
      method: 'POST',
      body: process_data(data),
    }, process_options(options)))
    .then(process_response);
  };

  API.delete = function(url, options) {
    return fetch(url, _.extend({
      method: 'DELETE',
    }, process_options(options)))
    .then(process_response);
  };

  API.put = function(url, data, options) {
    return fetch(url, _.extend({
      method: 'PUT',
      body: process_data(data),
    }, process_options(options)))
    .then(process_response);
  };

  API.patch = function(url, data, options) {
    return fetch(url, _.extend({
      method: 'PATCH',
      body: process_data(data),
    }, process_options(options)))
    .then(process_response);
  };

  var base64encode = window.btoa; // browser api

  API.login = function(login, password) {
    API.logout();

    return API.get('/api/auth?requester_type=ui', {
      headers: {
        'Authorization': 'Basic ' + base64encode([login, password].join(':')),
      },
    })
    .then(function(response) {
      sessionStorage.miq_token = response.auth_token;
    });
  };

  API.ws_destroy = function() {
    document.cookie = 'ws_token=; path=/ws/notifications; Max-Age=0;'
  };

  API.logout = function() {
    if (sessionStorage.miq_token) {
      API.delete('/api/auth');
    }

    API.ws_destroy();
    delete sessionStorage.miq_token;
  };

  API.autorenew = function() {
    var id = setInterval(function() {
      API.get('/api')
      .then(null, function() {
        console.warn('API autorenew fail', arguments);
        clearInterval(id);
      });
    }, 60 * 1000);

    return function() {
      clearInterval(id);
    };
  };

  API.ws_init = function() {
    return API.get('/api/auth?requester_type=ws').then(function(response) {
      API.ws_destroy();
      document.cookie = 'ws_token=' + response.auth_token + '; path=/ws/notifications';
    });
  };

  // default to using the error modal on error
  ["get", "post", "put", "delete", "options", "patch"].forEach(function(name) {
    var orig = API[name];

    API[name] = function() {
      return orig.apply(this, arguments)
        .catch(function(err) {
          sendDataWithRx({
            serverError: err,
            source: 'API',
          });

          console.error('API: Server returned a non-200 response:', err.status, err.statusText, err);
          throw err;
        });
    };
  });

  window.vanillaJsAPI = API;


  function process_options(o) {
    o = o || {};
    delete o.type;
    delete o.method;
    delete o.url;
    delete o.data;
    delete o.body;

    if (o.skipTokenRenewal) {
      o.headers = o.headers || {};
      o.headers['X-Auth-Skip-Token-Renewal'] = 'true';
    }

    if (sessionStorage.miq_token) {
      o.headers = o.headers || {};
      o.headers['X-Auth-Token'] = sessionStorage.miq_token;
    }

    if (o.headers) {
      o.headers = new Headers(o.headers);
    }

    return o;
  }

  function process_data(o) {
    if (!o || _.isString(o))
      return o;

    if (_.isPlainObject(o))
      return JSON.stringify(o);

    // fetch supports more types but we aren't using any of those yet..
    console.warning('Unknown type for request data - please provide a plain object or a string', o);
    return null;
  }

  function process_response(response) {
    if (response.status === 204) {
      // No content
      return null;
    }

    if (response.status >= 300) {
      // Not 1** or 2**
      return response.json()
        .then(function(obj) {
          return Promise.reject(obj);
        });
    }

    return response.json();
  }
})(window);


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
    login: angularify(vanillaJsAPI.login),
    logout: vanillaJsAPI.logout,
    autorenew: vanillaJsAPI.autorenew,
  };
}]);
