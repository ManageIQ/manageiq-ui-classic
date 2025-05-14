require('./miq_global.js');

window.logError = function(fn) {
  return function(text) {
    try {
      return fn(text);
    } catch (ex) {
      if (typeof console !== 'undefined' && typeof console.error !== 'undefined') {
        console.error('exception caught evaling RJS');
        console.error(ex);
        console.debug('script follows:', text);
      }
      return text;
    }
  };
}

jQuery.jsonPayload = function(text, fallback) {
  var parsed_json = jQuery.parseJSON(text);
  if (parsed_json.explorer) {
    return ManageIQ.explorer.process(parsed_json); // ExplorerPresenter payload
  }
  return fallback(text);
};

$.ajaxSetup({
  /* Define two script converters:

  1) script - This is the original converter to evaluate scripts for successful responses.
  2) miq_script - Define a duplicate but differently named script converter whose purpose is to
  evaluate scripts for unsuccessful ajax responses.  jQuery 3.5.0 changed the behavior of the script
  converter, replacing it with a no-op converter for scripts found in unsuccessful ajax responses.
  Successful responses would continue to be evaluated as previously.
  See: https://github.com/jquery/jquery/commit/da3dd85b63c4e3a6a768132c2a83a1a6eec24840

  Due to this change starting in 3.5.0, we define a new type of script we can set as the dataType
  so it's evaluated in the event of unsuccessful responses such as the SSO 401 unauthorized
  issue we attempted to fix in #9410 and subsequently completed in #9426.
  */
  accepts: {
    json: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript',
  },
  contents: {
    json: /application\/json/,
  },
  converters: {
    'text json': logError(function(text) {
      return jQuery.jsonPayload(text, function(text) {
        return jQuery.parseJSON(text);
      });
    }),
    'text miq_script': logError(function(text) {
      if (text.match(/^{/)) {
        return jQuery.jsonPayload(text, function(text) {
          return text;
        });
      }  // JavaScript payload
      jQuery.globalEval(text.slice('throw "error";'.length));
      return text;
    }),
    'text script': logError(function(text) {
      if (text.match(/^{/)) {
        return jQuery.jsonPayload(text, function(text) {
          return text;
        });
      }  // JavaScript payload
      jQuery.globalEval(text.slice('throw "error";'.length));
      return text;
    }),
  },
});
