

ManageIQ.angular.app.component('vmCloudEvacuateForm', {
	controller: 'vmCloudEvacuateFormController',
  controllerAs: 'vm',
  templateUrl: '/static/ansible-evacuate-form.html.haml',
  bindings: {
    'vmCloudEvacuateFormId': '@',
    'message': '@',
    'evacuate_items': '@',
  },
});
