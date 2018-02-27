ManageIQ.angular.app.component('repositoryFormComponent', {
  controller: 'repositoryFormController',
  controllerAs: 'vm',
  templateUrl: '/static/ansible-repository-form.html.haml',
  bindings: {
    'repositoryId': '@',
  },
});
