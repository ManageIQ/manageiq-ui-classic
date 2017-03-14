angular.module('miq.util').factory('metricsParseUrlFactory', function() {
  return function(dash, $window) {
    // get the pathname and remove trailing / if exist
    var pathname = $window.location.pathname.replace(/\/$/, '');
    dash.providerId = '/' + (/^\/[^\/]+\/([r\d]+)$/.exec(pathname)[1]);

    // TODO: get this values from GET/POST values ?
    dash.tenant = '_system';
    dash.minBucketDurationInSecondes = 20 * 60;
    dash.max_metrics = 1000;
  };
});
