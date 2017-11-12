ManageIQ.angular.app = angular.module('ManageIQ', [
  'ui.select',
  'ui.bootstrap',
  'ui.codemirror',
  'patternfly',
  'patternfly.charts',
  'frapontillo.bootstrap-switch',
  'angular.validators',
  'formly',
  'formlyBootstrap',
  'miq.api',
  'miq.card',
  'miq.compat',
  'miq.util',
  'kubernetesUI',
  'ManageIQ.fonticonPicker',
  'miqStaticAssets.dialogEditor',
  'miqStaticAssets.dialogUser',
  'miqStaticAssets.treeSelector',
  'miqStaticAssets.treeView',
]);
miqHttpInject(ManageIQ.angular.app);
// @Todo: Move to a external package like FormlyBootstrap does
ManageIQ.angular.app.run(function(formlyConfig) {
  formlyConfig.setType({
    name: 'mw-input',
    template: '<label>{{to.label}}</label><input ng-model="model[options.key]" readonly style="margin-left:15px;"/>'
  });
});

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

  return angular.bootstrap($(selector), [app], { strictDi: false });
}

function miqCallAngular(data) {
  ManageIQ.angular.scope.$apply(function() {
    ManageIQ.angular.scope[data.name].apply(ManageIQ.angular.scope, data.args);
  });
}

function sendDataWithRx(data) {
  ManageIQ.angular.rxSubject.onNext(data);
}
