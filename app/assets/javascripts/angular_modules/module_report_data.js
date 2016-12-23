miqHttpInject(
  angular.module('ManageIQ.report_data', [
    'miqStaticAssets', 'ui.bootstrap', 'patternfly.views'
  ])
  .config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    })
  }])
);
