ManageIQ.angular.app.component('vmCloudAddSecurityGroupComponent', {
  bindings: {
    recordId: '@',
    redirectUrl: '@',
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
      security_group: '',
    };
    vm.security_groups = [];
    vm.formId = vm.recordId;
    vm.saveable = miqService.saveable;
    vm.newRecord = true;
    miqService.sparkleOn();

    var currentSecurityGroups;

    $q.all([
      API.get('/api/instances/' + vm.recordId),
      API.get('/api/instances/' + vm.recordId + '/security_groups?expand=resources&attributes=id,name'),
    ])
      .then(function(data) {
        var tenantId = data[0].cloud_tenant_id;
        currentSecurityGroups = data[1].resources;

        return API.get('/api/cloud_tenants/' + tenantId + '/security_groups?expand=resources&attributes=id,name');
      })
      .then(function(data) {
        vm.security_groups = data.resources.filter(function(securityGroup) {
          return ! _.find(currentSecurityGroups, { id: securityGroup.id });
        });

        vm.afterGet = true;
        miqService.sparkleOff();
      }).catch(miqService.handleFailure);
  };

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    miqService.redirectBack(sprintf(__('Addition of security group was canceled by the user.')), 'warning', vm.redirectUrl);
  };

  vm.addClicked = function() {
    var saveObject = {
      name: vm.vmCloudModel.security_group,
      action: 'add',
    };
    var saveMsg = sprintf(__('%s has been successfully added.'), vm.vmCloudModel.security_group);
    miqService.sparkleOn();
    API.post('/api/instances/' + vm.recordId + '/security_groups/', saveObject)
      .then(miqService.redirectBack.bind(vm, saveMsg, 'success', vm.redirectUrl))
      .catch(miqService.handleFailure);
  };
}
