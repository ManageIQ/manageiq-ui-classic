import { miqFetch } from './fetch';

export default {
  get,
  post,
};

function nonApiOnly(url) {
  if (url.match(/^[^/]|(\/api($|\/))/)) {
    throw new Error(`${url} is an API endpoint URL, try using 'API' instead of 'http'`);
  }

  return url;
}

function get(url, options = {}) {
  return miqFetch({
    ...options,
    url: nonApiOnly(url),
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
    url: nonApiOnly(url),
    method: 'POST',
    backendName: __('http'),
    cookieAndCsrf: true,
  }, data);
}
