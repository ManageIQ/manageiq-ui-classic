ManageIQ.angular.app.component('vmCloudLiveMigrateForm', {
  controller: vmCloudLiveMigrateFormController,
  controllerAs: 'vm',
  templateUrl: '/static/vm_cloud/live_migrate.html.haml',
  bindings: {
    'recordId': '@',
  },
});

vmCloudLiveMigrateFormController.$inject = ['$http', '$scope', 'miqService'];

function vmCloudLiveMigrateFormController($http, $scope, miqService) {
  var vm = this;

  var init = function() {
    vm.vmCloudModel = {
      auto_select_host: true,
      cluster_id: null,
      destination_host_id: null,
      block_migration: false,
      disk_over_commit: false,
    };
    vm.clusters = [];
    vm.hosts = [];
    vm.filtered_hosts = [];
    vm.formId = vm.recordId;
    vm.modelCopy = angular.copy(vm.vmCloudModel);

    ManageIQ.angular.scope = vm;

    if (vm.recordId) {
      miqService.sparkleOn();
      $http.get('/vm_cloud/live_migrate_form_fields/' + vm.recordId)
        .then(getLiveMigrateFormData)
        .catch(miqService.handleFailure);
    }
  };

  vm.cancelClicked = $scope.cancelClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/live_migrate_vm/?button=cancel';
    if (vm.recordId) {
      url = '/vm_cloud/live_migrate_vm/' + vm.recordId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  vm.submitClicked = $scope.submitClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/live_migrate_vm?button=submit';
    if (vm.recordId) {
      url = '/vm_cloud/live_migrate_vm/' + vm.recordId + '?button=submit';
    }
    miqService.miqAjaxButton(url, vm.vmCloudModel);
  };

  function getLiveMigrateFormData(response) {
    var data = response.data;
    Object.assign(vm, data);
    vm.modelCopy = angular.copy(vm.vmCloudModel);
    miqService.sparkleOff();
  }

  vm.$onInit = init;
}

