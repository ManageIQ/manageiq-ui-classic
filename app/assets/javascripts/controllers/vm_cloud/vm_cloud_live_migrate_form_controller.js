ManageIQ.angular.app.controller('vmCloudLiveMigrateFormController', ['$http', '$scope', 'vmCloudLiveMigrateFormId', 'miqService', function($http, $scope, vmCloudLiveMigrateFormId, miqService) {
  var vm = this;

  vm.vmCloudModel = {
    auto_select_host:    true,
    cluster_id:          null,
    destination_host_id: null,
    block_migration:     false,
    disk_over_commit:    false,
  };
  vm.clusters = [];
  vm.hosts = [];
  vm.filtered_hosts = [];
  vm.formId = vmCloudLiveMigrateFormId;
  vm.modelCopy = angular.copy(vm.vmCloudModel);

  ManageIQ.angular.scope = vm;

  if (vmCloudLiveMigrateFormId) {
    $http.get('/vm_cloud/live_migrate_form_fields/' + vmCloudLiveMigrateFormId)
      .then(getLiveMigrateFormData)
      .catch(miqService.handleFailure);
  }

  $scope.cancelClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/live_migrate_vm/?button=cancel';
    if (vmCloudLiveMigrateFormId) {
      url = '/vm_cloud/live_migrate_vm/' + vmCloudLiveMigrateFormId + '?button=cancel';
    }

    miqService.miqAjaxButton(url);
  };

  $scope.submitClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/live_migrate_vm?button=submit';
    if (vmCloudLiveMigrateFormId) {
      url = '/vm_cloud/live_migrate_vm/' + vmCloudLiveMigrateFormId + '?button=submit';
    }
    miqService.miqAjaxButton(url, vm.vmCloudModel);
  };

  function getLiveMigrateFormData(response) {
    var data = response.data;
    Object.assign(vm, data);
    vm.modelCopy = angular.copy(vm.vmCloudModel);
    miqService.sparkleOff();
  }
}]);
