ManageIQ.angular.app.controller('vmCloudRemoveSecurityGroupFormController', ['$http', 'vmCloudRemoveSecurityGroupFormId', 'miqService', function($http, vmCloudRemoveSecurityGroupFormId, miqService) {
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
    $http.get('/vm_cloud/remove_security_group_form_fields/' + vmCloudRemoveSecurityGroupFormId).then(function(response) {
      var data = response.data;
      vm.security_groups = data.security_groups;
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
