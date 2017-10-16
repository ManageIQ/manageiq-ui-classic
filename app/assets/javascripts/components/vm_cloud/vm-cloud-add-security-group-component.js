ManageIQ.angular.app.component('vmCloudAddSecurityGroupComponent', {
  bindings: {
    recordId: '@',
  },
  controllerAs: 'vm',
  controller: vmCloudAddSecurityGroupFormController,
  templateUrl: '/static/vm_cloud/add_security_group.html.haml',
});

vmCloudAddSecurityGroupFormController.$inject = ['API', 'miqService', '$q'];

function vmCloudAddSecurityGroupFormController(API, miqService, $q) {
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

    var currentSecurityGroups;

    $q.all([
      API.get("/api/vms/" + vm.recordId),
      API.get("/api/vms/" + vm.recordId + "/security_groups?expand=resources&attributes=id,name"),
    ])
      .then(function(data) {
        var tenantId = data[0].cloud_tenant_id;
        currentSecurityGroups = data[1].resources;

        return API.get("/api/cloud_tenants/" + tenantId + "/security_groups?expand=resources&attributes=id,name");
      })
      .then(function(data) {
        vm.security_groups = data.resources.filter(function(securityGroup) {
          return ! _.find(currentSecurityGroups, { id: securityGroup.id });
        });

        vm.afterGet = true;
        vm.modelCopy = angular.copy(vm.vmCloudModel);
        miqService.sparkleOff();
      }).catch(miqService.handleFailure);
  };

  vm.cancelClicked = function() {
    var url = '/vm_cloud/add_security_group_vm/' + vm.recordId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  vm.addClicked = function() {
    var url = '/vm_cloud/add_security_group_vm/' + vm.recordId + '?button=submit';
    miqService.miqAjaxButton(url, vm.vmCloudModel, { complete: false });
  };
}
