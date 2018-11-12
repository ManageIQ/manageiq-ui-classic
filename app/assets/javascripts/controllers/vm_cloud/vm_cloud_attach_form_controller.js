ManageIQ.angular.app.controller('vmCloudAttachFormController', ['$scope', 'vmCloudAttachFormId', 'miqService', function($scope, vmCloudAttachFormId, miqService) {
  var vm = this;

  vm.vmCloudModel = { name: '' };
  vm.formId = vmCloudAttachFormId;
  vm.afterGet = false;
  vm.modelCopy = angular.copy(vm.vmCloudModel);

  ManageIQ.angular.scope = vm;

  $scope.submitClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/attach_volume/' + vmCloudAttachFormId + '?button=attach';
    miqService.miqAjaxButton(url, vm.vmCloudModel, {complete: false});
  };

  $scope.cancelClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/attach_volume/' + vmCloudAttachFormId + '?button=cancel';
    miqService.miqAjaxButton(url, {complete: false});
  };

  $scope.resetClicked = function() {
    vm.vmCloudModel = angular.copy(vm.modelCopy);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };
}]);
