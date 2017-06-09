ManageIQ.angular.app.controller('cloudNetworkFormController', ['cloudNetworkFormId', 'miqService', 'API', function(cloudNetworkFormId, miqService, API) {
  var vm = this;

  var init = function() {
    vm.cloudNetworkModel = { name: '', ems_id: '', cloud_tenant_id: '' };
    vm.formId = cloudNetworkFormId;
    vm.model = "cloudNetworkModel";
    vm.newRecord = cloudNetworkFormId === "new";
    vm.saveable = miqService.saveable;

    if (vm.newRecord) {
      vm.cloudNetworkModel.name = "";
      vm.cloudNetworkModel.enabled = true;
      vm.cloudNetworkModel.external_facing = false;
      vm.cloudNetworkModel.shared = false;
      vm.cloudNetworkModel.vlan_transparent = false;
      vm.afterGet = false;
      vm.modelCopy = angular.copy( vm.cloudNetworkModel );
    } else {
      miqService.sparkleOn();
      API.get("/api/cloud_networks/" + cloudNetworkFormId + "?attributes=cloud_tenant").then(function(data) {
        vm.cloudNetworkModel.name = data.name;
        vm.cloudNetworkModel.cloud_tenant_name = data.cloud_tenant.name;
        vm.cloudNetworkModel.enabled = data.enabled;
        vm.cloudNetworkModel.external_facing = data.external_facing;
        vm.cloudNetworkModel.port_security_enabled = data.port_security_enabled;
        vm.cloudNetworkModel.provider_network_type = data.provider_network_type;
        vm.cloudNetworkModel.qos_policy_id = data.qos_policy_id;
        vm.cloudNetworkModel.shared = data.shared;
        vm.cloudNetworkModel.vlan_transparent = data.vlan_transparent;
        vm.afterGet = true;
        vm.modelCopy = angular.copy( vm.cloudNetworkModel );
      }).catch(miqService.handleFailure);
      miqService.sparkleOff();
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
