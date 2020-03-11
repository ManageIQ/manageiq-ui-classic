ManageIQ.angular.app.component('vmCloudEvacuateForm', {
  controller: vmCloudEvacuateFormController,
  controllerAs: 'vm',
  templateUrl: '/static/evacuate-form.html.haml',
  bindings: {
    'recordId': '@',
  },
});

vmCloudEvacuateFormController.$inject = ['$http', '$scope', 'miqService'];
function vmCloudEvacuateFormController($http, $scope, miqService) {
  var vm = this;

  var init = function() {
    vm.vmCloudModel = {
      auto_select_host: true,
      destination_host: null,
      on_shared_storage: true,
      admin_password: null,
    };
    vm.hosts = [];
    vm.formId = vm.recordId;
    vm.modelCopy = angular.copy(vm.vmCloudModel);
    vm.newRecord = true;
    vm.saveable = miqService.saveable;

    ManageIQ.angular.scope = $scope;
    $scope.saveable = miqService.saveable;

    if (vm.recordId) {
      miqService.sparkleOn();
      $http.get('/vm_cloud/evacuate_form_fields/' + vm.recordId)
        .then(getEvacuateFormData)
        .catch(miqService.handleFailure);
    }
  };

  vm.cancelClicked = $scope.cancelClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/evacuate_vm?button=cancel';
    if (vm.recordId) {
      url = '/vm_cloud/evacuate_vm/' + vm.recordId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  vm.submitClicked = $scope.submitClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/evacuate_vm?button=submit';
    if (vm.recordId) {
      url = '/vm_cloud/evacuate_vm/' + vm.recordId + '?button=submit';
    }
    miqService.miqAjaxButton(url, vm.vmCloudModel);
  };

  var getEvacuateFormData = function(response) {
    var data = response.data;
    Object.assign(vm, data);
    vm.modelCopy = angular.copy(vm.vmCloudModel);
    miqService.sparkleOff();
  };

  vm.$onInit = init;
}
