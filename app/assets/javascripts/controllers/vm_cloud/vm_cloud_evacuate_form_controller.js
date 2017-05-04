ManageIQ.angular.app.controller('vmCloudEvacuateFormController', ['$http', '$scope', 'vmCloudEvacuateFormId', 'miqService', function($http, $scope, vmCloudEvacuateFormId, miqService) {
  var vm = this;
  vm.vmCloudModel = {
    auto_select_host:    true,
    destination_host:    null,
    on_shared_storage:   true,
    admin_password:      null
  };
  vm.hosts = [];
  vm.formId = vmCloudEvacuateFormId;
  vm.modelCopy = angular.copy( vm.vmCloudModel );

  ManageIQ.angular.scope = vm;

  if (vmCloudEvacuateFormId) {
    $http.get('/vm_cloud/evacuate_form_fields/' + vmCloudEvacuateFormId)
      .then(getEvacuateFormData)
      .catch(miqService.handleFailure);
  }

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/evacuate_vm?button=cancel';
    if (vmCloudEvacuateFormId) {
      url = '/vm_cloud/evacuate_vm/' + vmCloudEvacuateFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  vm.submitClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/evacuate_vm?button=submit';
    if (vmCloudEvacuateFormId) {
      url = '/vm_cloud/evacuate_vm/' + vmCloudEvacuateFormId + '?button=submit';
    }
    miqService.miqAjaxButton(url, true);
  };

  function getEvacuateFormData(response) {
    var data = response.data;

    vm.hosts = data.hosts;
    vm.modelCopy = angular.copy(vm.vmCloudModel);
    miqService.sparkleOff();
  }
}]);
