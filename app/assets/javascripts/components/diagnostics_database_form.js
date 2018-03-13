ManageIQ.angular.app.component('diagnosticsDatabaseFormComponent', {
  controller: 'diagnosticsDatabaseFormController',
  controllesAs: 'vm',
  templateUrl: '/static/diagnostics-database-tab.html.haml',
  bindings: {
    'diagnosticsDatabaseId': '@',
  },
});
