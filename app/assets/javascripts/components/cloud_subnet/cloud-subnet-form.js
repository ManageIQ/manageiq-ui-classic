ManageIQ.angular.app.component('cloudSubnetForm', {
  bindings: {
    cloudSubnetFormId: '@',
  },
  controllerAs: 'vm',
  controller: cloudSubnetFormController,
  templateUrl: '/static/cloud_subnet/cloud-subnet-form.html.haml',
});

cloudSubnetFormController.$inject = ['API', 'miqService'];

function cloudSubnetFormController(API, miqService) {
  var vm = this;

  this.$onInit = function() {
    vm.afterGet = false;

    vm.cloudSubnetModel = { name: '' };
    vm.networkProtocols = ['ipv4', 'ipv6'];

    vm.formId = vm.cloudSubnetFormId;
    vm.model = 'cloudSubnetModel';
    ManageIQ.angular.scope = vm;
    vm.saveable = miqService.saveable;

    vm.newRecord = vm.cloudSubnetFormId === 'new';

    miqService.sparkleOn();
    if (vm.newRecord) {
      vm.cloudSubnetModel.ems_id = '';
      vm.cloudSubnetModel.network_id = '';
      vm.cloudSubnetModel.dhcp_enabled = true;
      vm.cloudSubnetModel.network_protocol = 'ipv4';
      API.get("/api/providers?expand=resources&attributes=name&filter[]=type='*NetworkManager'").then(function(data) {
        vm.available_ems = data.resources;
        vm.afterGet = true;
        vm.modelCopy = angular.copy( vm.cloudSubnetModel );
        miqService.sparkleOff();
      }).catch(miqService.handleFailure);
    } else {
      API.get('/api/cloud_subnets/' + vm.cloudSubnetFormId + '?expand=resources&attributes=ext_management_system.name,cloud_tenant.name,cloud_network.name').then(function(data) {
        Object.assign(vm.cloudSubnetModel, _.pick(data, 'name', 'ext_management_system', 'cloud_network', 'cloud_tenant', 'network_protocol', 'cidr', 'dhcp_enabled', 'gateway'));
        vm.afterGet = true;
        vm.modelCopy = angular.copy( vm.cloudSubnetModel );
        miqService.sparkleOff();
      }).catch(miqService.handleFailure);
    }
  };

  vm.addClicked = function() {
    var url = 'create/new?button=add';
    miqService.miqAjaxButton(url, vm.cloudSubnetModel, { complete: false });
  };

  vm.cancelClicked = function() {
    var url = '';
    if (vm.newRecord) {
      url = '/cloud_subnet/create/new?button=cancel';
    } else {
      url = '/cloud_subnet/update/' + vm.cloudSubnetFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  vm.saveClicked = function() {
    var url = '/cloud_subnet/update/' + vm.cloudSubnetFormId + '?button=save';
    miqService.miqAjaxButton(url, _.pick(vm.cloudSubnetModel, 'name', 'dhcp_enabled', 'gateway'), { complete: false });
  };

  vm.resetClicked = function(angularForm) {
    vm.cloudSubnetModel = angular.copy( vm.modelCopy );
    angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.filterNetworkManagerChanged = function(id) {
    if (id) {
      API.get('/api/cloud_networks?expand=resources&attributes=name,ems_ref&filter[]=ems_id=' + id).then(function(data) {
        vm.available_networks = data.resources;
      }).catch(miqService.handleFailure);
      miqService.getProviderTenants(function(data) {
        vm.available_tenants = data.resources;
      })(id);
    }
  };
}
