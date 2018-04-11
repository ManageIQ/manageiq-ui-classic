ManageIQ.angular.app.controller('cloudSubnetFormController', ['cloudSubnetFormId', 'miqService', 'API', function(cloudSubnetFormId, miqService, API) {
  var vm = this;

  var init = function() {
    vm.afterGet = false;
    vm.cloudSubnetModel = {
      name: "",
      ems_id: "",
      cloud_tenant_id: "",
      network_id: "",
    };
    vm.ems = [];

    vm.networkProtocols = ["ipv4", "ipv6"];
    vm.formId = cloudSubnetFormId;
    vm.model = "cloudSubnetModel";
    vm.newRecord = cloudSubnetFormId === "new";
    ManageIQ.angular.scope = vm;
    vm.saveable = miqService.saveable;

    if (vm.newRecord) {
      vm.cloudSubnetModel.dhcp_enabled = true;
      vm.cloudSubnetModel.network_protocol = "ipv4";
      vm.afterGet = true;
      vm.modelCopy = angular.copy( vm.cloudSubnetModel );

      miqService.networkProviders()
        .then(function(providers) {
          vm.ems = providers;
        });
    } else {
      miqService.sparkleOn();
      API.get("/api/cloud_subnets/" + cloudSubnetFormId + "?expand=resources&attributes=ext_management_system.name,cloud_tenant.name,cloud_network.name").then(function(data) {
        vm.cloudSubnetModel.name = data.name;
        vm.cloudSubnetModel.ems_name = data.ext_management_system.name;
        vm.cloudSubnetModel.tenant_name = angular.isDefined(data.cloud_tenant) ? data.cloud_tenant.name : undefined;
        vm.cloudSubnetModel.network_name = data.cloud_network.name;
        vm.cloudSubnetModel.dhcp_enabled = data.dhcp_enabled;
        vm.cloudSubnetModel.cidr = data.cidr;
        vm.cloudSubnetModel.gateway = data.gateway;
        vm.cloudSubnetModel.network_protocol = data.network_protocol;
        vm.afterGet = true;
        vm.modelCopy = angular.copy( vm.cloudSubnetModel );
        miqService.sparkleOff();
      }).catch(miqService.handleFailure);
    }
  };

  vm.addClicked = function() {
    var url = 'create/new' + '?button=add';
    miqService.miqAjaxButton(url, vm.cloudSubnetModel, { complete: false });
  };

  vm.cancelClicked = function() {
    if (cloudSubnetFormId == 'new') {
      var url = '/cloud_subnet/create/new' + '?button=cancel';
    } else {
      var url = '/cloud_subnet/update/' + cloudSubnetFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  vm.saveClicked = function() {
    var url = '/cloud_subnet/update/' + cloudSubnetFormId + '?button=save';
    miqService.miqAjaxButton(url, vm.cloudSubnetModel, { complete: false });
  };

  vm.resetClicked = function(angularForm) {
    vm.cloudSubnetModel = angular.copy( vm.modelCopy );
    angularForm.$setPristine(true);
    miqService.miqFlash("warn", "All changes have been reset");
  };

  vm.filterNetworkManagerChanged = function(id) {
    miqService.sparkleOn();
    if (id) {
      API.get("/api/cloud_networks?expand=resources&attributes=name,ems_ref&filter[]=ems_id=" + id).then(function(data) {
        vm.available_networks = data.resources;
      }).catch(miqService.handleFailure);

      miqService.getProviderTenants(function(data) {
        vm.available_tenants = data.resources;
      })(id);
    }
    miqService.sparkleOff();
  };

  init();
}]);
