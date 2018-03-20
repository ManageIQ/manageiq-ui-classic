ManageIQ.angular.app.component('diagnosticsDatabaseFormComponent', {
  controller: 'diagnosticsDatabaseFormController',
  controllerAs: 'vm',
  templateUrl: '/static/diagnostics-database-tab.html.haml',
  bindings: {
    'diagnosticsDatabaseId': '@',
  },
});
