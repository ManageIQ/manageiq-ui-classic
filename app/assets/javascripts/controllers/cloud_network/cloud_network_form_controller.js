ManageIQ.angular.app.controller('cloudNetworkFormController', ['cloudNetworkFormId', 'miqService', 'API', function(cloudNetworkFormId, miqService, API) {
  var vm = this;

  var init = function() {
    vm.afterGet = false;
    vm.cloudNetworkModel = { name: '' };
    vm.providers_network_types = {
      "Local": "local",
      "Flat": "flat",
      "GRE": "gre",
      "VLAN": "vlan",
      "VXLAN": "vxlan",
    };
    vm.network_types_for_segmentation = /vlan|vxlan|gre/;
    vm.formId = cloudNetworkFormId;
    vm.model = "cloudNetworkModel";
    vm.newRecord = cloudNetworkFormId === "new";
    ManageIQ.angular.scope = vm;
    vm.saveable = miqService.saveable;

    if (vm.newRecord) {
      vm.cloudNetworkModel.enabled = true;
      vm.cloudNetworkModel.external_facing = false;
      vm.cloudNetworkModel.shared = false;
      vm.cloudNetworkModel.vlan_transparent = false;
      vm.afterGet = true;
      vm.modelCopy = angular.copy( vm.cloudNetworkModel );
    } else {
      miqService.sparkleOn();
      API.get("/api/cloud_networks/" + cloudNetworkFormId + "?attributes=cloud_tenant,ext_management_system.name").then(function(data) {
        Object.assign(vm.cloudNetworkModel, data);
        vm.cloudNetworkModel.ems_name = data.ext_management_system.name;
        vm.cloudNetworkModel.cloud_tenant_name = data.cloud_tenant.name;
        vm.afterGet = true;
        vm.modelCopy = angular.copy( vm.cloudNetworkModel );
        miqService.sparkleOff();
      }).catch(miqService.handleFailure);
    }
  };

  vm.addClicked = function() {
    var url = 'create/new' + '?button=add';
    miqService.miqAjaxButton(url, vm.cloudNetworkModel, { complete: false });
  };

  vm.cancelClicked = function() {
    if (vm.newRecord) {
      var url = '/cloud_network/create/new' + '?button=cancel';
    } else {
      var url = '/cloud_network/update/' + cloudNetworkFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  vm.saveClicked = function() {
    var url = '/cloud_network/update/' + cloudNetworkFormId + '?button=save';
    miqService.miqAjaxButton(url, vm.cloudNetworkModel, { complete: false });
  };

  vm.resetClicked = function(angularForm) {
    vm.cloudNetworkModel = angular.copy( vm.modelCopy );
    angularForm.$setPristine(true);
    miqService.miqFlash("warn", "All changes have been reset");
  };

  vm.filterNetworkManagerChanged = miqService.getProviderTenants(function(data) {
    vm.available_tenants = data.resources;
  });

  init();
}]);
