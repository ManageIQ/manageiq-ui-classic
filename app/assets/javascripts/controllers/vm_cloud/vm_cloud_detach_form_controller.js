ManageIQ.angular.app.controller('vmCloudDetachFormController', ['$scope', 'vmCloudDetachFormId', 'miqService', function($scope, vmCloudDetachFormId, miqService) {
  var vm = this;

  vm.vmCloudModel = { name: '' };
  vm.formId = vmCloudDetachFormId;
  vm.afterGet = false;
  vm.modelCopy = angular.copy( vm.vmCloudModel );

  ManageIQ.angular.scope = vm;

  vm.submitClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/detach_volume/' + vmCloudDetachFormId + '?button=detach';
    miqService.miqAjaxButton(url, vm.vmCloudModel);
  };

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/detach_volume/' + vmCloudDetachFormId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  vm.resetClicked = function() {
    vm.vmCloudModel = angular.copy(vm.modelCopy);
    miqService.miqFlash("warn", "All changes have been reset");
  };
}]);
