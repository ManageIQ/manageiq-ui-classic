ManageIQ.angular.app.controller('networkRouterFormController', ['$scope', 'networkRouterFormId', 'miqService', 'API', function($scope, networkRouterFormId, miqService, API) {
  var vm = this;

  var init = function() {
    vm.afterGet = false;

    vm.networkRouterModel = {
      cloud_tenant: {
        id: null,
      },
      external_fixed_ips: [],
      external_gateway: false,
      extra_attributes: null,
      // extra_attributes: { external_gateway_info: { enable_snat: true, external_fixed_ips: [], network_id: null }}
    };
    vm.ems = [];

    vm.formId = networkRouterFormId;
    vm.model = 'networkRouterModel';
    vm.newRecord = networkRouterFormId === 'new';
    vm.saveable = miqService.saveable;

    vm.saveUrl = vm.newRecord ? '/network_router/create/new' : '/network_router/update/' + networkRouterFormId;

    miqService.sparkleOn();
    if (vm.newRecord) {
      miqService.networkProviders()
        .then(function(providers) {
          vm.ems = providers;

          vm.networkRouterModel.name = '';
          vm.networkRouterModel.admin_state_up = true;
          vm.networkRouterModel.cloud_subnet_id = null;

          vm.afterGet = true;
          vm.modelCopy = angular.copy(vm.networkRouterModel);
          miqService.sparkleOff();
        });
    } else {
      return API.get('/api/network_routers/' + networkRouterFormId + '?attributes=name,admin_state_up,cloud_network_id,cloud_tenant.name,ext_management_system.id,ext_management_system.name,extra_attributes').then(function(data) {
        Object.assign(vm.networkRouterModel, data);
        vm.networkRouterModel.admin_state_up = vm.networkRouterModel.admin_state_up == 't' ? true : false;
        if (vm.networkRouterModel.extra_attributes.external_gateway_info && vm.networkRouterModel.extra_attributes.external_gateway_info != {}) {
          vm.networkRouterModel.external_gateway = true;
          if (vm.networkRouterModel.extra_attributes.external_gateway_info.external_fixed_ips) {
            var ref = vm.networkRouterModel.extra_attributes.external_gateway_info.external_fixed_ips[0].subnet_id;
            return vm.getSubnetByRef(ref);
          }
        }
      }).then(function() {
        return vm.getCloudNetworksByEms(vm.networkRouterModel.ext_management_system.id);
      }).then(function() {
        return vm.getCloudSubnetsByNetworkID(vm.networkRouterModel.cloud_network_id);
      }).then(function() {
        vm.afterGet = true;
        vm.modelCopy = angular.copy(vm.networkRouterModel);
        miqService.sparkleOff();
      }).catch(miqService.handleFailure);
    }
  };

  vm.getCloudNetworksByEms = function(id) {
    if (id) {
      return API.get('/api/cloud_networks?expand=resources&attributes=name,ems_ref&filter[]=external_facing=true&filter[]=ems_id=' + id).then(function(data) {
        vm.available_networks = data.resources;
      }).catch(miqService.handleFailure);
    }
  };

  vm.getCloudSubnetsByNetworkID = function(id) {
    if (id) {
      return API.get('/api/cloud_subnets?expand=resources&attributes=name,ems_ref&filter[]=cloud_network_id=' + id).then(function(data) {
        vm.available_subnets = data.resources;
      }).catch(miqService.handleFailure);
    }
  };

  vm.getSubnetByRef = function(ref) {
    if (ref) {
      return API.get('/api/cloud_subnets?expand=resources&attributes=name&filter[]=ems_ref=' + ref).then(function(data) {
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
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.filterNetworkManagerChanged = function(id) {
    vm.getCloudNetworksByEms(id);
    miqService.getProviderTenants(function(data) {
      vm.available_tenants = data.resources;
    })(id);
  };

  init();
}]);
