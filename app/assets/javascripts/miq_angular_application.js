ManageIQ.angular.app = angular.module('ManageIQ', [
  'ManageIQ.fonticonPicker',
  'angular.validators',
  'ngRedux',
  'frapontillo.bootstrap-switch',
  'kubernetesUI',
  'miq.api',
  'miq.card',
  'miq.compat',
  'miq.util',
  'miqStaticAssets.dialogEditor',
  'miqStaticAssets.dialogUser',
  'miqStaticAssets.treeSelector',
  'miqStaticAssets.treeView',
  'miqStaticAssets.quadicon',
  'miqStaticAssets.common',
  'ngSanitize',
  'patternfly',
  'patternfly.charts',
  'ui.bootstrap',
  'ui.codemirror',
  'ui.select',
]);
miqHttpInject(ManageIQ.angular.app);

ManageIQ.constants = {
  reportData: 'report_data',
};

function miqHttpInject(angular_app) {
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
          });

          console.error('$http: Server returned a non-200 response:', err.status, err.statusText, err);
          return $q.reject(err);
        },
      };
    }]);
  }]);

  return angular_app;
}

function miq_bootstrap(selector, app) {
  app = app || 'ManageIQ';

  return angular.bootstrap($(selector), [app], { strictDi: true });
}

function miqCallAngular(data) {
  ManageIQ.angular.scope.$apply(function() {
    ManageIQ.angular.scope[data.name].apply(ManageIQ.angular.scope, data.args);
  });
}
