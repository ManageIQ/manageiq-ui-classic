ManageIQ.angular.app.component('vmCloudAddSecurityGroupComponent', {
  bindings: {
    recordId: '@',
  },
  controllerAs: 'vm',
  controller: vmCloudAddSecurityGroupFormController,
  templateUrl: '/static/vm_cloud/add_security_group.html.haml',
});

vmCloudAddSecurityGroupFormController.$inject = ['API', 'miqService'];

function vmCloudAddSecurityGroupFormController(API, miqService) {
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
    miqService.sparkleOn();
    API.get("/api/vms/" + vm.recordId).then(function(data) {
      tenantId = data.cloud_tenant_id;
      API.get("/api/vms/" + vm.recordId + "/security_groups?expand=resources&attributes=id,name").then(function(data) {
        currentSecurityGroups = data.resources;      
        API.get("/api/cloud_tenants/" + tenantId + "/security_groups?expand=resources&attributes=id,name").then(function(data) {
          vm.security_groups = data.resources.filter(function (securityGroup) {
            for (currentSecurityGroup of currentSecurityGroups) {
              if (securityGroup.id == currentSecurityGroup.id) {
                return false;
              }
            }
            return true;
          });
          vm.afterGet = true;
          vm.modelCopy = angular.copy( vm.vmCloudModel );
        }).catch(miqService.handleFailure);
      }).catch(miqService.handleFailure);
    }).catch(miqService.handleFailure);
    miqService.sparkleOff();
  };

  vm.cancelClicked = function() {
    var url = '/vm_cloud/add_security_group_vm/' + vm.recordId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  vm.resetClicked = function(angularForm) {
    vm.CloudModel = angular.copy( vm.modelCopy );
    angularForm.$setPristine(true);
    miqService.miqFlash("warn", "All changes have been reset");
  };

  vm.saveClicked = function() {
    var url = '/vm_cloud/add_security_group_vm/' + vm.recordId + '?button=submit';
    miqService.miqAjaxButton(url, vm.vmCloudModel, { complete: false });
  };
}
