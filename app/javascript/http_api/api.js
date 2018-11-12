import { miqFetch } from './fetch';
import { base64encode } from './compat';

const { miqDeferred } = window;

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
  return (url, options) => miqFetch({
    ...options,
    method,
    url,
    backendName: __('API'),
  }, null);
}

function withData(method) {
  return (url, data, options) => miqFetch({
    ...options,
    method,
    url,
    backendName: __('API'),
  }, data);
}


API.login = (login, password) => {
  API.logout();

  return API.get('/api/auth?requester_type=ui', {
    headers: {
      Authorization: `Basic ${base64encode([login, password].join(':'))}`,
    },
    skipErrors: [401, 503],
    skipLoginRedirect: true,
  })
    .then((response) => {
      localStorage.miq_token = response.auth_token;
    });
};

API.ws_destroy = () => {
  document.cookie = 'ws_token=; path=/ws/notifications; Max-Age=0;';
};

API.logout = () => {
  // delete user allowed features data from local storage
  delete localStorage.userFeatures;
  if (localStorage.miq_token) {
    API.delete('/api/auth', {
      skipErrors: [401],
      skipLoginRedirect: true,
    });
  }

  API.ws_destroy();
  delete localStorage.miq_token;
};

API.autorenew = () => {
  const id = setInterval(() => {
    API.get('/api')
      .then(null, (...args) => {
        console.warn('API autorenew fail', args);
        clearInterval(id);
      });
  }, 60 * 1000);

  return () => clearInterval(id);
};

API.ws_init = () => API.get('/api/auth?requester_type=ws').then((response) => {
  API.ws_destroy();
  document.cookie = `ws_token=${response.auth_token}; path=/ws/notifications`;
});

API.wait_for_task = (taskId) => {
  const deferred = miqDeferred();

  const retry = () => {
    API.get(`/api/tasks/${taskId}?attributes=task_results`)
      .then((result) => {
        if (result.state === 'Finished') { // MiqTask::STATE_FINISHED
          deferred.resolve(result);
        } else {
          setTimeout(retry, 1000);
        }
      })
      .catch((error) => {
        deferred.reject(error);
      });
  };

  const failOnBadStatus = (result) => {
    if (result.status !== 'Ok') {
      return Promise.reject(result);
    }

    return result;
  };

  retry();
  return deferred.promise
    .then(failOnBadStatus);
};
