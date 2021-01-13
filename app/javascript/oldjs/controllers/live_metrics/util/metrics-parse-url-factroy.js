angular.module('miq.util').factory('metricsParseUrlFactory', function() {
  var re = /([^&=]+)=?([^&]*)/g;
  var decodeRE = /\+/g;  // Regex for replacing addition symbol with a space
  var decode = function(str) {
    return decodeURIComponent( str.replace(decodeRE, ' ') );
  };

  var parseParams = function(query) {
    var params = {};
    var e;

    e = re.exec(query);
    while (e) {
      var k = decode( e[1] );
      var v = decode( e[2] );

      if (k.substring(k.length - 2) === '[]') {
        k = k.substring(0, k.length - 2);
        (params[k] || (params[k] = [])).push(v);
      } else {
        params[k] = v;
      }

      e = re.exec(query);
    }
    return params;
  };

  return function(dash, $window) {
    // get the pathname and remove trailing / if exist
    var pathname = $window.location.pathname.replace(/\/$/, '');

    dash.params = parseParams($window.location.search);
    dash.providerId = '/' + (/^\/[^\/]+\/([r\d]+)$/.exec(pathname)[1]);

    dash.tenantList = [];
    dash.minBucketDurationInSecondes = parseInt(dash.params.bucket, 10) || 20 * 60;
    dash.max_metrics = parseInt(dash.params.max_metrics, 10) || 10000;
    dash.items_per_page = parseInt(dash.params.items_per_page, 10) || 8;

    // the proxy service shuold use the currect tenant if none is given
    dash.url = '/container_dashboard/data' + dash.providerId  + '/?live=true';
  };
});
