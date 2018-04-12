ManageIQ.angular.app.controller('networkRouterFormController', ['$scope', 'networkRouterFormId', 'miqService', 'API', function($scope, networkRouterFormId, miqService, API) {
  var vm = this;

  vm.afterGet = false;
  vm.networkRouterModel = {
    name: '',
    cloud_subnet_id: null,
    cloud_tenant_name: null,
    enable_snat: true,
    external_gateway: false,
    external_fixed_ips: [],
    extra_attributes: null
  };

  vm.formId = networkRouterFormId;
  vm.model = "networkRouterModel";
  vm.ems = [];

  ManageIQ.angular.scope = vm;

  vm.newRecord = networkRouterFormId === "new";
  vm.saveable = miqService.saveable;

  vm.saveUrl = vm.newRecord ? '/network_router/create/new' : '/network_router/update/' + networkRouterFormId;

  if (vm.newRecord) {
    vm.networkRouterModel.name = "";
    vm.networkRouterModel.enable_snat = true;
    vm.networkRouterModel.external_gateway = false;
    vm.networkRouterModel.cloud_subnet_id = null;
    vm.newRecord = true;

    miqService.networkProviders()
      .then(function(providers) {
        vm.ems = providers;
      });
  } else {
    miqService.sparkleOn();
    API.get("/api/network_routers/" + networkRouterFormId + "?attributes=name,ems_id,admin_state_up,cloud_network_id,extra_attributes,cloud_tenant,ext_management_system,cloud_subnets").then(function(data) {
      vm.networkRouterModel.name = data.name;
      vm.networkRouterModel.cloud_network_id = data.cloud_network_id;
      vm.networkRouterModel.ems_id = data.ext_management_system.id;
      vm.networkRouterModel.ems_name = data.ext_management_system.name;
      vm.networkRouterModel.cloud_tenant_name = data.cloud_tenant.name;
      vm.networkRouterModel.extra_attributes = data.extra_attributes;
    }).then(function() {
      if (data.extra_attributes.external_gateway_info && data.networkRouterModel.extra_attributes.external_gateway_info !== {}) {
        vm.networkRouterModel.external_gateway = true;
        vm.networkRouterModel.enable_snat = vm.networkRouterModel.extra_attributes.external_gateway_info.enable_snat;
        vm.networkRouterModel.external_fixed_ips = vm.networkRouterModel.extra_attributes.external_gateway_info.external_fixed_ips;
      }
    }).then(function() {
      if (vm.networkRouterModel.external_gateway) {
        var ref = vm.networkRouterModel.extra_attributes.external_gateway_info.external_fixed_ips[0].subnet_id;
        getSubnetByRef(ref);
      }
    }).then(function() {
      getCloudNetworksByEms(vm.networkRouterModel.ems_id);
    }).then(function() {
      getCloudSubnetsByNetworkID(vm.networkRouterModel.cloud_network_id);
    }).then(function() {
      vm.afterGet = true;
      vm.modelCopy = angular.copy(vm.networkRouterModel);
      miqService.sparkleOff();
    }).catch(miqService.handleFailure);
  }

  var getCloudNetworksByEms = function(id) {
    if (id) {
      API.get("/api/cloud_networks?expand=resources&attributes=name,ems_ref&filter[]=external_facing=true&filter[]=ems_id=" + id).then(function(data) {
        vm.available_networks = data.resources;
      }).catch(miqService.handleFailure);
    }
  };

  var getCloudSubnetsByNetworkID = function(id) {
    if (id) {
      API.get("/api/cloud_subnets?expand=resources&attributes=name,ems_ref&filter[]=cloud_network_id=" + id).then(function(data) {
        vm.available_subnets = data.resources;
      }).catch(miqService.handleFailure);
    }
  };

  var getSubnetByRef = function(ref) {
    if (ref) {
      API.get("/api/cloud_subnets?expand=resources&attributes=name&filter[]=ems_ref=" + ref).then(function(data) {
        vm.networkRouterModel.cloud_subnet_id = data.resources[0].id;
      }).catch(miqService.handleFailure);
    }
  };

  vm.addClicked = function() {
    var url = vm.saveUrl + '?button=add';
    miqService.miqAjaxButton(url, vm.networkRouterModel, { complete: false });
  };

  vm.cancelClicked = function() {
    var url = vm.saveUrl + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  vm.saveClicked = function() {
    var url = vm.saveUrl + '?button=save';
    miqService.miqAjaxButton(url, vm.networkRouterModel, { complete: false });
  };

  vm.addInterfaceClicked = function() {
    miqService.sparkleOn();
    var url = '/network_router/add_interface/' + networkRouterFormId + '?button=add';
    miqService.miqAjaxButton(url, vm.networkRouterModel, { complete: false });
  };

  vm.removeInterfaceClicked = function() {
    miqService.sparkleOn();
    var url = '/network_router/remove_interface/' + networkRouterFormId + '?button=remove';
    miqService.miqAjaxButton(url, vm.networkRouterModel, { complete: false });
  };

  vm.resetClicked = function() {
    vm.networkRouterModel = angular.copy( vm.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", "All changes have been reset");
  };

  vm.filterNetworkManagerChanged = function(id) {
    miqService.sparkleOn();
    if (id) {
      getCloudNetworksByEms(id);
      miqService.getProviderTenants(function(data) {
        vm.available_tenants = data.resources;
      })(id);
    }
    miqService.sparkleOff();
  };

  vm.filterCloudNetworkChanged = function(id) {
    miqService.sparkleOn();
    if (id) {
      getCloudSubnetsByNetworkID(id);
    }
    miqService.sparkleOff();
  };
}]);
