ManageIQ.angular.app.controller('vmCloudEvacuateFormController', ['$http', '$scope','vmCloudEvacuateFormId', 'miqService', 'message', function($http, $scope,vmCloudEvacuateFormId, miqService, message) {
  var vm = this;
  vm.vmCloudModel = {
    auto_select_host:    true,
    destination_host:    null,
    on_shared_storage:   true,
    admin_password:      null
  };
  vm.hosts = [];
  vm.formId = vmCloudEvacuateFormId;
  vm.message = message;
  vm.modelCopy = angular.copy(vm.vmCloudModel);

  ManageIQ.angular.scope = vm;
  $scope.saveable = miqService.saveable;


  if (vmCloudEvacuateFormId) {
    $http.get('/vm_cloud/evacuate_form_fields/' + vmCloudEvacuateFormId)
      .then(getEvacuateFormData)
      .catch(miqService.handleFailure);
  }

  $scope.cancelClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/evacuate_vm?button=cancel';
    if (vmCloudEvacuateFormId) {
      url = '/vm_cloud/evacuate_vm/' + vmCloudEvacuateFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  $scope.submitClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/evacuate_vm?button=submit';
    if (vmCloudEvacuateFormId) {
      url = '/vm_cloud/evacuate_vm/' + vmCloudEvacuateFormId + '?button=submit';
    }
    miqService.miqAjaxButton(url, vm.vmCloudModel);
  };

  function getEvacuateFormData(response) {
    var data = response.data;
    Object.assign(vm, data);
    vm.modelCopy = angular.copy(vm.vmCloudModel);
    miqService.sparkleOff();
  }
}]);
