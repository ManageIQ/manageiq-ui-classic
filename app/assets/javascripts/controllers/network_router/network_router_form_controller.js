ManageIQ.angular.app.controller('networkRouterFormController', ['$http', '$scope', 'networkRouterFormId', 'miqService', 'API', function($http, $scope, networkRouterFormId, miqService, API) {
  var vm = this;

  var init = function() {
    vm.afterGet = false;
    vm.networkRouterModel = {
      name: '',
      cloud_subnet_id: null,
      cloud_tenant: null,
      enable_snat: true,
      external_gateway: false,
      extra_attributes: null,
    };

<<<<<<< HEAD
  vm.formId = networkRouterFormId;
  vm.model = "networkRouterModel";
  vm.ems = [];

  ManageIQ.angular.scope = vm;

  vm.newRecord = networkRouterFormId === "new";
  vm.saveable = miqService.saveable;

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
      Object.assign(vm.networkRouterModel, data);
      if (data.extra_attributes.external_gateway_info && data.extra_attributes.external_gateway_info !== {}) {
        vm.networkRouterModel.external_gateway = true;
      }
    }).then(function() {
      if (vm.networkRouterModel.external_gateway) {
        getSubnetByRef(vm.networkRouterModel.extra_attributes.external_gateway_info.external_fixed_ips[0].subnet_id);
      }
    }).then(function() {
      getCloudNetworksByEms(vm.networkRouterModel.ext_management_system.id);
    }).then(function() {
      getCloudSubnetsByNetworkID(vm.networkRouterModel.cloud_network_id);
    }).then(function() {
=======
    vm.formId = networkRouterFormId;
    vm.model = "networkRouterModel";
    vm.newRecord = networkRouterFormId === "new";
    vm.saveable = miqService.saveable;

    if (vm.newRecord) {
>>>>>>> Using init() and lodash isEmpty
      vm.afterGet = true;
      vm.modelCopy = angular.copy(vm.networkRouterModel);
    } else {
      miqService.sparkleOn();
      API.get("/api/network_routers/" + networkRouterFormId + "?attributes=name,ems_id,admin_state_up,cloud_network_id,extra_attributes,cloud_tenant,ext_management_system,cloud_subnets").then(function(data) {
        Object.assign(vm.networkRouterModel, data);
        if (data.extra_attributes.external_gateway_info && ! _.isEmpty(data.extra_attributes.external_gateway_info)) {
          vm.networkRouterModel.external_gateway = true;
        }
      }).then(function() {
        if (vm.networkRouterModel.external_gateway) {
          getSubnetByRef(vm.networkRouterModel.extra_attributes.external_gateway_info.external_fixed_ips[0].subnet_id);
        }
      }).then(function() {
        getCloudNetworksByEms(vm.networkRouterModel.ext_management_system.id);
      }).then(function() {
        getCloudSubnetsByNetworkID(vm.networkRouterModel.cloud_network_id);
      }).then(function() {
        vm.afterGet = true;
        vm.modelCopy = angular.copy(vm.networkRouterModel);
        miqService.sparkleOff();
      }).catch(miqService.handleFailure);
    }
  };

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
    var url = 'create/new?button=add';
    miqService.miqAjaxButton(url, vm.networkRouterModel, { complete: false });
  };

  vm.cancelClicked = function() {
    if (networkRouterFormId == 'new') {
      var url = '/network_router/create/new' + '?button=cancel';
    } else {
      var url = '/network_router/update/' + networkRouterFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  vm.saveClicked = function() {
    var url = '/network_router/update/' + networkRouterFormId + '?button=save';
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
    getCloudNetworksByEms(id);
    miqService.getProviderTenants(function(data) {
      vm.available_tenants = data.resources;
    })(id);
  };

  vm.filterCloudNetworkChanged = function(id) {
    getCloudSubnetsByNetworkID(id);
  };

  init();
}]);
