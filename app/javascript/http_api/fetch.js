import { sendDataWithRx } from '../miq_observable';

const { redirectLogin } = window;

export function miqFetch(options, data = null) {
  const fetchOpts = {
    ...processOptions(options),
    body: processData(data),
  };

  return fetch(options.url, fetchOpts)
    .then(responseAndError(options));
}

function processOptions(options) {
  const o = Object.assign({}, options);

  delete o.body;
  delete o.data;
  delete o.skipErrors;
  delete o.type;
  delete o.url;
  delete o.transformResponse;

  o.headers = o.headers || {};

  if (o.skipTokenRenewal) {
    o.headers['X-Auth-Skip-Token-Renewal'] = 'true';
    delete o.skipTokenRenewal;
  }

  if (localStorage.miq_token) {
    o.headers['X-Auth-Token'] = localStorage.miq_token;
  }

  if (o.csrf) {
    o.headers['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
    delete o.csrf;
  }

  if (Object.keys(o.headers).length) {
    o.headers = new Headers(o.headers);
  }

  return o;
}

function processData(o) {
  if (!o || _.isString(o)) {
    return o;
  }

  if (_.isPlainObject(o)) {
    return JSON.stringify(o);
  }

  // fetch supports more types but we aren't using any of those yet..
  console.warn('Unknown type for request data - please provide a plain object or a string', o);
  return null;
}

function processResponse(response) {
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

function responseAndError(options = {}) {
  return (response) => {
    let ret = processResponse(response);

    if ((response.status === 401) && !options.skipLoginRedirect) {
      // Unauthorized - always redirect to dashboard#login
      redirectLogin(sprintf(__('%s logged out, redirecting to the login page'), options.backendName));
      return ret;
    }

    // apply a custom transformation
    if (options.transformResponse) {
      ret = ret.then(options.transformResponse);
    }

    // true means skip all of them - no error modal at all
    if (options.skipErrors === true) {
      return ret;
    }

    return ret.catch((err) => {
      // no skipping by default
      errorModal(err, options.skipErrors || [], options.backendName);

      return Promise.reject(err);
    });
  };
}

// non-JSON error message, assuming html
function tryHtmlError(response) {
  return () => response.text();
}

function rejectWithData(response) {
  return obj => Promise.reject({ // eslint-disable-line prefer-promise-reject-errors
    data: obj,
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
  });
}

function errorModal(err, skipErrors, backendName) {
  // only show error modal unless the status code is in the list
  if (!skipErrors.includes(err.status)) {
    sendDataWithRx({
      serverError: err,
      source: 'fetch',
      backendName,
    });

    console.error('API: Server returned a non-200 response:', err.status, err.statusText, err);
  }
}
