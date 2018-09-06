import { miqFetch } from './fetch';
import { base64encode } from './compat';
const miqDeferred = window.miqDeferred;

/*
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
 * the API token is persisted into localStorage
 */

const API = {
  delete: urlOnly('DELETE'),
  get: urlOnly('GET'),
  options: urlOnly('OPTIONS'),
  patch: withData('PATCH'),
  post: withData('POST'),
  put: withData('PUT'),
};

export default API;

function urlOnly(method) {
  return function(url, options) {
    return miqFetch({
      ...options,
      method,
      url,
      backendName: __('API'),
    }, null);
  };
}

function withData(method) {
  return function(url, data, options) {
    return miqFetch({
      ...options,
      method,
      url,
      backendName: __('API'),
    }, data);
  };
}


API.login = function(login, password) {
  API.logout();

  return API.get('/api/auth?requester_type=ui', {
    headers: {
      'Authorization': 'Basic ' + base64encode([login, password].join(':')),
    },
    skipErrors: [401, 503],
    skipLoginRedirect: true,
  })
    .then(function(response) {
      localStorage.miq_token = response.auth_token;
    });
};

API.ws_destroy = function() {
  document.cookie = 'ws_token=; path=/ws/notifications; Max-Age=0;';
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
  const id = setInterval(function() {
    API.get('/api')
      .then(null, function(...args) {
        console.warn('API autorenew fail', args);
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
  const deferred = miqDeferred();

  const retry = function() {
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

  const failOnBadStatus = function(result) {
    if (result.status !== 'Ok') {
      return Promise.reject(result);
    }

    return result;
  };

  retry();
  return deferred.promise
    .then(failOnBadStatus);
};
