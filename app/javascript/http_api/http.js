import { miqFetch } from './fetch';

export default {
  get,
  post,
};

function get(url, options = {}) {
  return miqFetch({
    ...options,
    url,
    method: 'GET',
    backendName: __('http'),
    cookieAndCsrf: true,
  });
}

function post(url, data, { headers, ...options } = {}) {
  return miqFetch({
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    url,
    method: 'POST',
    backendName: __('http'),
    cookieAndCsrf: true,
  }, data);
}
