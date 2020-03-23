ManageIQ.angular.app.controller('vmCloudAttachFormController', ['$scope', 'vmCloudAttachFormId', 'miqService', function($scope, vmCloudAttachFormId, miqService) {
  var vm = this;

  vm.vmCloudModel = { name: '' };
  vm.formId = vmCloudAttachFormId;
  vm.afterGet = false;
  vm.modelCopy = angular.copy(vm.vmCloudModel);
  vm.saveable = miqService.saveable;

  ManageIQ.angular.scope = $scope;

  vm.submitClicked = $scope.submitClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/attach_volume/' + vmCloudAttachFormId + '?button=attach';
    miqService.miqAjaxButton(url, vm.vmCloudModel, {complete: false});
  };

  vm.cancelClicked = $scope.cancelClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/attach_volume/' + vmCloudAttachFormId + '?button=cancel';
    miqService.miqAjaxButton(url, {complete: false});
  };

  vm.resetClicked = $scope.resetClicked = function() {
    vm.vmCloudModel = angular.copy(vm.modelCopy);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };
}]);
