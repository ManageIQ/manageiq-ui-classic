ManageIQ.angular.app.component('cloudSubnetForm', {
  bindings: {
    cloudSubnetFormId: '@',
  },
  controllerAs: 'vm',
  controller: cloudSubnetFormController,
  templateUrl: '/static/cloud_subnet/cloud-subnet-form.html.haml',
});

cloudSubnetFormController.$inject = ['API', 'miqService', '$scope'];

function cloudSubnetFormController(API, miqService, $scope) {
  var vm = this;

  this.$onInit = function() {
    vm.afterGet = false;

    vm.cloudSubnetModel = { name: '' };
    vm.networkProtocols = ['ipv4', 'ipv6'];

    vm.formId = vm.cloudSubnetFormId;
    vm.model = 'cloudSubnetModel';
    ManageIQ.angular.scope = $scope;
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
        Object.assign(vm.cloudSubnetModel, _.pick(data, 'name', 'ext_management_system', 'cloud_network', 'cloud_tenant', 'network_protocol', 'cidr', 'dhcp_enabled', 'gateway', 'extra_attributes', 'dns_nameservers'));
        vm.cloudSubnetModel.allocation_pools = "";
        vm.cloudSubnetModel.host_routes = "";
        if (vm.cloudSubnetModel.extra_attributes !== undefined) {
          if (vm.cloudSubnetModel.extra_attributes.allocation_pools !== undefined) {
            vm.cloudSubnetModel.extra_attributes.allocation_pools.forEach(function(val, i) {
              if (i > 0) {
                vm.cloudSubnetModel.allocation_pools += "\n";
              }
              vm.cloudSubnetModel.allocation_pools += val["start"] + "," + val["end"];
            });
          }
          if (vm.cloudSubnetModel.extra_attributes.host_routes !== undefined) {
            vm.cloudSubnetModel.extra_attributes.host_routes.forEach(function(val, i) {
              if (i > 0) {
                vm.cloudSubnetModel.host_routes += "\n";
              }
              vm.cloudSubnetModel.host_routes += val["destination"] + "," + val["nexthop"];
            });
          }
        }
        if (vm.cloudSubnetModel.dns_nameservers !== undefined) {
          vm.cloudSubnetModel.dns_nameservers = vm.cloudSubnetModel.dns_nameservers.join("\n");
        } else {
          vm.cloudSubnetModel.dns_nameservers = "";
        }
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
    miqService.miqAjaxButton(url, _.pick(vm.cloudSubnetModel, 'name', 'dhcp_enabled', 'gateway', 'allocation_pools', 'host_routes', 'dns_nameservers'), { complete: false });
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
