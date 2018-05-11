import { miqFetch } from './fetch';

export default {
  get,
  post,
};

function get(url) {
  return miqFetch({
    url,
    method: 'GET',
    csrf: true,
    backendName: __('http'),
  });
}

function post(url, data) {
  return miqFetch({
    url,
    method: 'POST',
    csrf: true,
    backendName: __('http'),
  }, data);
}
