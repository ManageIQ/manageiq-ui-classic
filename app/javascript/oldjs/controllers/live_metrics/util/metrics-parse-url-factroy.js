angular.module('miq.util').factory('metricsParseUrlFactory', function() {
  var paramsToObject = (entries) => {
    const result = {}
    for(const [key, value] of entries) {
      result[key] = value;
    }
    return result;
  }

  return function(dash, $window) {
    // get the pathname and remove trailing / if exist
    var pathname = $window.location.pathname.replace(/\/$/, '');

    var params = new URLSearchParams($window.location.search);
    dash.params = paramsToObject(params);

    dash.providerId = '/' + (/^\/[^\/]+\/([r\d]+)$/.exec(pathname)[1]);

    dash.tenantList = [];
    dash.minBucketDurationInSecondes = parseInt(dash.params.bucket, 10) || 20 * 60;
    dash.max_metrics = parseInt(dash.params.max_metrics, 10) || 10000;
    dash.items_per_page = parseInt(dash.params.items_per_page, 10) || 8;

    // the proxy service shuold use the currect tenant if none is given
    dash.url = '/container_dashboard/data' + dash.providerId  + '/?live=true';
  };
});
