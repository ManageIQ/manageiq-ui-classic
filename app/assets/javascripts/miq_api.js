/* global miqDeferred, add_flash */

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

  var urlOnly = function(method) {
    return function(url, options) {
      return fetch(url, _.extend({
        method: method,
      }, process_options(options)))
      .then(responseAndError(options));
    };
  };

  var withData = function(method) {
    return function(url, data, options) {
      return fetch(url, _.extend({
        method: method,
        body: process_data(data),
      }, process_options(options)))
      .then(responseAndError(options));
    };
  };

  API.delete = urlOnly('DELETE');
  API.get = urlOnly('GET');
  API.options = urlOnly('OPTIONS');
  API.patch = withData('PATCH');
  API.post = withData('POST');
  API.put = withData('PUT');

  API.login = function(login, password) {
    API.logout();

    return API.get('/api/auth?requester_type=ui', {
      headers: {
        'Authorization': 'Basic ' + base64encode([login, password].join(':')),
      },
      skipErrors: [401],
      skipLoginRedirect: true,
    })
    .then(function(response) {
      localStorage.miq_token = response.auth_token;
    });
  };

  API.ws_destroy = function() {
    document.cookie = 'ws_token=; path=/ws/notifications; Max-Age=0;'
  };

  API.logout = function() {
    if (localStorage.miq_token) {
      API.delete('/api/auth', {
        skipErrors: [401],
        skipLoginRedirect: true,
      });
    }

    API.ws_destroy();
    delete localStorage.miq_token;
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

  API.wait_for_task = function(taskId) {
    var deferred = miqDeferred();

    var retry = function() {
      API.get('/api/tasks/' + taskId + '?attributes=task_results')
        .then(function(result) {
          if (result.state === 'Finished') {  // MiqTask::STATE_FINISHED
            deferred.resolve(result);
          } else {
            setTimeout(retry, 1000);
          }
        })
        .catch(function(error) {
          deferred.reject(error);
        });
    };

    var failOnBadStatus = function(result) {
      if (result.status !== 'Ok') {
        return Promise.reject(result);
      }

      return result;
    };

    retry();
    return deferred.promise
      .then(failOnBadStatus);
  };

  window.vanillaJsAPI = API;


  function process_options(o) {
    o = Object.assign({}, o || {});
    delete o.type;
    delete o.method;
    delete o.url;
    delete o.data;
    delete o.body;
    delete o.skipErrors;

    if (o.skipTokenRenewal) {
      o.headers = o.headers || {};
      o.headers['X-Auth-Skip-Token-Renewal'] = 'true';
    }

    if (localStorage.miq_token) {
      o.headers = o.headers || {};
      o.headers['X-Auth-Token'] = localStorage.miq_token;
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
      return Promise.resolve(null);
    }

    if (response.status >= 300) {
      // Not 1** or 2**
      // clone() because otherwise if json() fails, you can't call text()
      return response.clone().json()
        .catch(tryHtmlError(response))
        .then(rejectWithData(response));
    }

    return response.json();
  }

  function responseAndError(options) {
    options = options || {};

    return function(response) {
      var ret = process_response(response);

      if ((response.status === 401) && !options.skipLoginRedirect) {
        // Unauthorized - always redirect to dashboard#login
        redirectLogin(__('API logged out, redirecting to the login page'));
        return ret;
      }

      // true means skip all of them - no error modal at all
      if (options.skipErrors === true) {
        return ret;
      }

      return ret.catch(function(err) {
        // no skipping by default
        errorModal(err, options.skipErrors || []);

        return Promise.reject(err);
      });
    };
  }

  function tryHtmlError(response) {
    return function() {
      // non-JSON error message, assuming html
      return response.text();
    };
  }

  function rejectWithData(response) {
    return function(obj) {
      return Promise.reject({
        data: obj,
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
    };
  }

  function errorModal(err, skipErrors) {
    // only show error modal unless the status code is in the list
    if (! skipErrors.includes(err.status)) {
      sendDataWithRx({
        serverError: err,
        source: 'API',
      });

      console.error('API: Server returned a non-200 response:', err.status, err.statusText, err);
    }
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
    wait_for_task: angularify(vanillaJsAPI.wait_for_task),
    login: angularify(vanillaJsAPI.login),
    logout: vanillaJsAPI.logout,
    autorenew: vanillaJsAPI.autorenew,
  };
}]);
