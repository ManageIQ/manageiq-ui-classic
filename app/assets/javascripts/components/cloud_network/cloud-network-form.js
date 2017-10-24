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
      "None": "",
      "Local": "local",
      "Flat": "flat",
      "GRE": "gre",
      "VLAN": "vlan",
      "VXLAN": "vxlan",
    };

    vm.available_ems = [];
    vm.network_types_for_segmentation = /vlan|vxlan|gre/;
    vm.formId = vm.cloudNetworkFormId;
    vm.model = "cloudNetworkModel";
    ManageIQ.angular.scope = vm;
    vm.saveable = miqService.saveable;

    vm.newRecord = vm.cloudNetworkFormId === "new";

    if (vm.newRecord) {
      vm.cloudNetworkModel.enabled = true;
      vm.cloudNetworkModel.external_facing = false;
      vm.cloudNetworkModel.shared = false;
      vm.cloudNetworkModel.vlan_transparent = false;
      vm.afterGet = true;
      vm.modelCopy = angular.copy( vm.cloudNetworkModel );
      API.get("/api/providers?expand=resources&attributes=name&filter[]=type='*NetworkManager'").then(function(data) {
        vm.available_ems = data.resources;
      }).catch(miqService.handleFailure);
    } else {
      miqService.sparkleOn();
      API.get("/api/cloud_networks/" + vm.cloudNetworkFormId + "?attributes=cloud_tenant,ext_management_system").then(function(data) {
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
    if (vm.newRecord) {
      var url = '/cloud_network/create/new?button=cancel';
    } else {
      var url = '/cloud_network/update/' + vm.cloudNetworkFormId + '?button=cancel';
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
    miqService.miqFlash("warn", "All changes have been reset");
  };

  vm.filterNetworkManagerChanged = function(id) {
    miqService.getProviderTenants(function(data) {
      vm.available_tenants = data.resources;
    })(id);
  };
}
