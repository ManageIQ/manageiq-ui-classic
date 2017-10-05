ManageIQ.angular.app.component('vmCloudRemoveSecurityGroupComponent', {
  bindings: {
    recordId: '@',
  },
  controllerAs: 'vm',
  controller: vmCloudRemoveSecurityGroupFormController,
  templateUrl: '/static/vm_cloud/remove_security_group.html.haml',
});

vmCloudRemoveSecurityGroupFormController.$inject = ['API', 'miqService'];

function vmCloudRemoveSecurityGroupFormController(API, miqService) {
  var vm = this;

  vm.$onInit = function() {
    vm.afterGet = false;
    vm.vmCloudModel = {
      security_group: null,
    };
    vm.security_groups = [];
    vm.formId = vm.recordId;
    vm.model = "vmCloudModel";
    vm.saveable = miqService.saveable;
    vm.newRecord = true;
    miqService.sparkleOn();
    API.get("/api/vms/" + vm.recordId + "/security_groups?expand=resources&attributes=id,name").then(function(data) {
      vm.security_groups = data.resources;
      vm.afterGet = true;
      vm.modelCopy = angular.copy( vm.vmCloudModel );
      miqService.sparkleOff();
    }).catch(miqService.handleFailure);
  };

  vm.cancelClicked = function() {
    var url = '/vm_cloud/remove_security_group_vm/' + vm.recordId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  vm.addClicked = function() {
    var url = '/vm_cloud/remove_security_group_vm/' + vm.recordId + '?button=submit';
    miqService.miqAjaxButton(url, vm.vmCloudModel, { complete: false });
  };
}
