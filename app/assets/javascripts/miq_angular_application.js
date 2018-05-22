ManageIQ.angular.app = angular.module('ManageIQ', [
  'ManageIQ.fonticonPicker',
  'angular.validators',
  'frapontillo.bootstrap-switch',
  'kubernetesUI',
  'miq.api',
  'miq.card',
  'miq.compat',
  'miq.util',
  'miqStaticAssets.dialogEditor',
  'miqStaticAssets.dialogUser',
  'miqStaticAssets.miqSelect',
  'miqStaticAssets.treeSelector',
  'miqStaticAssets.treeView',
  'ngSanitize',
  'patternfly',
  'patternfly.charts',
  'ui.bootstrap',
  'ui.codemirror',
  'ui.select',
]);
miqHttpInject(ManageIQ.angular.app);

ManageIQ.angular.rxSubject = new Rx.Subject();

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

function sendDataWithRx(data) {
  ManageIQ.angular.rxSubject.onNext(data);
}
