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
    csrf: true,
    backendName: __('http'),
    credentials: 'include',
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
    csrf: true,
    backendName: __('http'),
    credentials: 'include',
  }, data);
}
