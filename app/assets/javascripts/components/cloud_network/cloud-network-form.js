ManageIQ.angular.app.component('cloudNetworkForm', {
  bindings: {
    cloudNetworkFormId: '@',
  },
  controllerAs: 'vm',
  controller: cloudNetworkFormController,
  templateUrl: '/static/cloud_network/cloud-network-form.html.haml',
});

cloudNetworkFormController.$inject = ['API', 'miqService'];

function cloudNetworkFormController(API, miqService) {
  var vm = this;

  this.$onInit = function() {
    vm.afterGet = false;

    vm.cloudNetworkModel = { name: '' };
    vm.providers_network_types = {
      'None': '',
      'Local': 'local',
      'Flat': 'flat',
      'GRE': 'gre',
      'VLAN': 'vlan',
      'VXLAN': 'vxlan',
    };

    vm.ems = [];
    vm.network_types_for_segmentation = /vlan|vxlan|gre/;
    vm.network_types_for_physical_network = /vlan|flat/;
    vm.formId = vm.cloudNetworkFormId;
    vm.model = 'cloudNetworkModel';
    ManageIQ.angular.scope = vm;
    vm.saveable = miqService.saveable;

    vm.newRecord = vm.cloudNetworkFormId === 'new';

    miqService.sparkleOn();
    if (vm.newRecord) {
      vm.cloudNetworkModel.enabled = true;
      vm.cloudNetworkModel.external_facing = false;
      vm.cloudNetworkModel.shared = false;
      vm.cloudNetworkModel.vlan_transparent = false;
      miqService.networkProviders()
        .then(function(providers) {
          vm.ems = providers;

          vm.afterGet = true;
          vm.modelCopy = angular.copy( vm.cloudNetworkModel );
          miqService.sparkleOff();
        });
    } else {
      API.get('/api/cloud_networks/' + vm.cloudNetworkFormId + '?attributes=cloud_tenant.id,cloud_tenant.name,ext_management_system.name').then(function(data) {
        Object.assign(vm.cloudNetworkModel, data);
        vm.afterGet = true;
        vm.modelCopy = angular.copy( vm.cloudNetworkModel );
        miqService.sparkleOff();
      }).catch(miqService.handleFailure);
    }
  };

  vm.addClicked = function() {
    var url = 'create/new?button=add';
    miqService.miqAjaxButton(url, vm.cloudNetworkModel, { complete: false });
  };

  vm.cancelClicked = function() {
    var url;
    if (vm.newRecord) {
      url = '/cloud_network/create/new?button=cancel';
    } else {
      url = '/cloud_network/update/' + vm.cloudNetworkFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  vm.saveClicked = function() {
    var url = '/cloud_network/update/' + vm.cloudNetworkFormId + '?button=save';
    miqService.miqAjaxButton(url, vm.cloudNetworkModel, { complete: false });
  };

  vm.resetClicked = function(angularForm) {
    vm.cloudNetworkModel = angular.copy( vm.modelCopy );
    angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.filterNetworkManagerChanged = function(id) {
    miqService.getProviderTenants(function(data) {
      vm.available_tenants = data.resources;
    })(id);
  };
}
