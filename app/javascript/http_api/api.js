import { miqFetch } from './fetch';

const { miqDeferred } = window;

/*
 * API.get(url, options) - use API.get('/api'), returns a Promise
 * API.delete - (the same)
 * API.post(url, data, options) - returns Promise
 * API.put - (the same)
 * API.patch - (the same)
 * API.options - (the same)
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

function apiOnly(url) {
  const path = new URL(url, document.location.href);
  if (!path.pathname.match(/^\/api($|\/)/)) {
    throw new Error(`${url} is not a valid API endpoint URL, try using 'http' instead of 'API'`);
  }

  return url;
}

function urlOnly(method) {
  return (url, options) => miqFetch({
    ...options,
    method,
    url: apiOnly(url),
    backendName: __('API'),
    cookieAndCsrf: true,
  }, null);
}

function withData(method) {
  return (url, data, options) => miqFetch({
    ...options,
    method,
    url: apiOnly(url),
    backendName: __('API'),
    cookieAndCsrf: true,
  }, data);
}

API.ws_destroy = () => {
  document.cookie = 'ws_token=; path=/ws/notifications; Max-Age=0;';
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
