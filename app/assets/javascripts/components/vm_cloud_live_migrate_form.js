

ManageIQ.angular.app.component('vmCloudLiveMigrateForm', {
  controller: 'vmCloudLiveMigrateFormController',
  controllerAs: 'vm',
  templateUrl: '/static/live_migrate.html.haml',
  bindings: {
    'vmCloudLiveMigrateFormId': '@',
    'message': '@',
  },
});
