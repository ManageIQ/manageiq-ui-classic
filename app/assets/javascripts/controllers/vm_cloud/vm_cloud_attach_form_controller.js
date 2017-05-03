ManageIQ.angular.app.controller('vmCloudAttachFormController', ['$scope', 'vmCloudAttachFormId', 'miqService', function($scope, vmCloudAttachFormId, miqService) {
  vm = this;

  vm.vmCloudModel = { name: '' };
  vm.formId = vmCloudAttachFormId;
  vm.afterGet = false;
  vm.modelCopy = angular.copy( vm.vmCloudModel );

  ManageIQ.angular.scope = $scope;

  vm.submitClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/attach_volume/' + vmCloudAttachFormId + '?button=attach';
    miqService.miqAjaxButton(url, true);
  };

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/attach_volume/' + vmCloudAttachFormId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  vm.resetClicked = function() {
    vm.vmCloudModel = angular.copy( vm.modelCopy );
    vm.angularForm.$setPristine(true);
    miqService.miqFlash("warn", "All changes have been reset");
  };
}]);
