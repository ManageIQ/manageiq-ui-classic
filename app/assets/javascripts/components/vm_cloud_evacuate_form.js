

ManageIQ.angular.app.component('vmCloudEvacuateForm', {
	controller: vmCloudEvacuateFormController,
  controllerAs: 'vm',
  templateUrl: '/static/evacuate-form.html.haml',
  bindings: {
    'vmCloudEvacuateFormId': '@',
    'message': '@',
  },
});

vmCloudEvacuateFormController.$inject = ['$http', '$scope', 'miqService'];
function vmCloudEvacuateFormController ($http, $scope, miqService) {
  var vm = this;

  vm.vmCloudModel = {
    auto_select_host:    true,
    destination_host:    null,
    on_shared_storage:   true,
    admin_password:      null
  };
  vm.hosts = [];
  vm.formId = vm.vmCloudEvacuateFormId;
  vm.modelCopy = angular.copy(vm.vmCloudModel);

  ManageIQ.angular.scope = vm;
  $scope.saveable = miqService.saveable;

  if (vm.vmCloudEvacuateFormId) {
    $http.get('/vm_cloud/evacuate_form_fields/' + vm.vmCloudEvacuateFormId)
      .then(getEvacuateFormData)
      .catch(miqService.handleFailure);
  }

  $scope.cancelClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/evacuate_vm?button=cancel';
    if (vm.vmCloudEvacuateFormId) {
      url = '/vm_cloud/evacuate_vm/' + vm.vmCloudEvacuateFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  $scope.submitClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/evacuate_vm?button=submit';
    if (vm.vmCloudEvacuateFormId) {
      url = '/vm_cloud/evacuate_vm/' + vm.vmCloudEvacuateFormId + '?button=submit';
    }
    miqService.miqAjaxButton(url, vm.vmCloudModel);
  };

  function getEvacuateFormData(response) {
    var data = response.data;
    Object.assign(vm, data);
    vm.modelCopy = angular.copy(vm.vmCloudModel);
    miqService.sparkleOff();
  }
};
