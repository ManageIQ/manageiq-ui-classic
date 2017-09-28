ManageIQ.angular.app.controller('vmCloudRemoveSecurityGroupFormController', ['vmCloudRemoveSecurityGroupFormId', 'miqService', 'API', function(vmCloudRemoveSecurityGroupFormId, miqService, API) {
  var vm = this;

  var init = function() {
    vm.afterGet = false;
    vm.vmCloudModel = {
      security_group: null,
    };
    vm.security_groups = [];
    vm.formId = vmCloudRemoveSecurityGroupFormId;
    vm.model = "vmCloudModel";
    vm.saveable = miqService.saveable;
    miqService.sparkleOn();
    API.get("/api/vms/" + vmCloudRemoveSecurityGroupFormId + "/security_groups?expand=resources&attributes=id,name").then(function(data) {
      vm.security_groups = data.resources;
      vm.afterGet = true;
      vm.modelCopy = angular.copy( vm.vmCloudModel );
    }).catch(miqService.handleFailure);
    miqService.sparkleOff();
  };

  vm.cancelClicked = function() {
    var url = '/vm_cloud/remove_security_group_vm/' + vmCloudRemoveSecurityGroupFormId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  vm.resetClicked = function(angularForm) {
    vm.CloudModel = angular.copy( vm.modelCopy );
    angularForm.$setPristine(true);
    miqService.miqFlash("warn", "All changes have been reset");
  };

  vm.saveClicked = function() {
    var url = '/vm_cloud/remove_security_group_vm/' + vmCloudRemoveSecurityGroupFormId + '?button=submit';
    miqService.miqAjaxButton(url, vm.vmCloudModel, { complete: false });
  };

  init();
}]);
