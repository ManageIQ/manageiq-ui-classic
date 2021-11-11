ManageIQ.angular.app = angular.module('ManageIQ', [
  'angular.validators', // FIXME: require('angular.validators'),
  'frapontillo.bootstrap-switch', // FIXME: require('angular-bootstrap-switch'),
  'gettext', // FIXME: require('angular-gettext'),
  'miq.api',
  'miq.card',
  'miq.compat',
  'miq.util',
  'miqStaticAssets',
  'miqStaticAssets.common',
  'miqStaticAssets.dialogEditor',
  'miqStaticAssets.dialogUser',
  'miqStaticAssets.fonticonPicker',
  'miqStaticAssets.miqSelect',
  'miqStaticAssets.treeSelector',
  'miqStaticAssets.treeView',
  'ngSanitize', // FIXME: require('angular-sanitize'),
  'patternfly',
  'patternfly.charts',
  'patternfly.views',
  'ui.bootstrap',
  'ui.codemirror',
]);
miqHttpInject(ManageIQ.angular.app);

ManageIQ.constants = {
  reportData: 'report_data',
};

function miqHttpInject(angular_app) {
  angular_app.config(['$locationProvider', function($locationProvider) {
    /**
     * hashPrefix must be empty othervise it will conflict with HashRouter and create infinite loop
     * React HashRouter can be configured to have hashbang prefix,
     * but both $locationProvider and ReactRouter must have the same prefix!
     */
    $locationProvider.hashPrefix('');
  }]);
  angular_app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common['X-Angular-Request'] = true;
    $httpProvider.defaults.headers.common['X-CSRF-Token'] = function() {
      return $('meta[name=csrf-token]').attr('content');
    };

    $httpProvider.interceptors.push(['$q', function($q) {
      return {
        responseError: function(err) {
          if (err.status === 401) {
            // Unauthorized - always redirect to dashboard#login
            redirectLogin(__('$http session timed out, redirecting to the login page'));
            return $q.reject(err);
          }

          sendDataWithRx({
            serverError: err,
            source: '$http',
            backendName: __('$http'),
          });

          console.error('$http: Server returned a non-200 response:', err.status, err.statusText, err);
          return $q.reject(err);
        },
      };
    }]);
  }]);

  return angular_app;
}

window.miq_bootstrap = function(selector, app) {
  app = app || 'ManageIQ';

  return angular.bootstrap($(selector), [app], { strictDi: true });
}
