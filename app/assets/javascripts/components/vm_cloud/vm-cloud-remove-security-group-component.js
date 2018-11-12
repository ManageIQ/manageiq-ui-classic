ManageIQ.angular.app.component('vmCloudRemoveSecurityGroupComponent', {
  bindings: {
    recordId: '@',
    redirectUrl: '@',
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
      security_group: '',
    };
    vm.security_groups = [];
    vm.formId = vm.recordId;
    vm.model = 'vmCloudModel';
    vm.saveable = miqService.saveable;
    vm.newRecord = false;
    miqService.sparkleOn();
    API.get('/api/instances/' + vm.recordId + '/security_groups?expand=resources&attributes=id,name').then(function(data) {
      vm.security_groups = data.resources;
      vm.afterGet = true;
      miqService.sparkleOff();
    }).catch(miqService.handleFailure);
  };

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    miqService.redirectBack(sprintf(__('Removal of security group was canceled by the user.')), 'warning', vm.redirectUrl);
  };

  vm.saveClicked = function() {
    var saveObject = {
      name: vm.vmCloudModel.security_group,
      action: 'remove',
    };
    var saveMsg = sprintf(__('%s has been successfully removed.'), vm.vmCloudModel.security_group);
    miqService.sparkleOn();
    API.post('/api/instances/' + vm.recordId + '/security_groups/', saveObject)
      .then(miqService.redirectBack.bind(vm, saveMsg, 'success', vm.redirectUrl))
      .catch(miqService.handleFailure);
  };
}
