ManageIQ.angular.app.controller('floatingIpFormController', ['$scope', 'floatingIpFormId', 'miqService', 'API', function($scope, floatingIpFormId, miqService, API) {
  var vm = this;

  var init = function() {
    vm.afterGet = false;

    vm.floatingIpModel = { address: null };
    vm.ems = [];

    vm.formId = floatingIpFormId;
    vm.model = 'floatingIpModel';
    vm.newRecord = floatingIpFormId === 'new';
    vm.saveable = miqService.saveable;

    vm.saveUrl = vm.newRecord ? '/floating_ip/create/new' : '/floating_ip/update/' + floatingIpFormId;

    vm.fields = [
      'address',
      'cloud_network_id',
      'cloud_tenant_id',
      'ems_id',
      'network_port.ems_ref',
    ];

    miqService.sparkleOn();
    if (vm.newRecord) {
      miqService.networkProviders()
        .then(function(providers) {
          vm.ems = providers;

          vm.afterGet = true;
          vm.modelCopy = angular.copy(vm.floatingIpModel);
          miqService.sparkleOff();
        });
    } else {
      API.get('/api/floating_ips/' +  floatingIpFormId + '?attributes=cloud_network,cloud_tenant,ext_management_system,network_port').then(function(data) {
        Object.assign(vm.floatingIpModel, data);
        vm.afterGet = true;
        vm.modelCopy = angular.copy(vm.floatingIpModel);
        miqService.sparkleOff();
      }).catch(miqService.handleFailure);
    }
  };

  vm.addClicked = function() {
    var url = vm.saveUrl + '?button=add';
    miqService.miqAjaxButton(url, vm.filteredModel(), { complete: false });
  };

  vm.cancelClicked = function() {
    var url = vm.saveUrl + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  vm.saveClicked = function() {
    var url = vm.saveUrl + '?button=save';
    miqService.miqAjaxButton(url, vm.filteredModel(), { complete: false });
  };

  vm.resetClicked = function() {
    vm.floatingIpModel = angular.copy( vm.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.filteredModel = function() {
    return _.pick(vm.floatingIpModel, vm.fields);
  };

  vm.filterNetworkManagerChanged = function(id) {
    miqService.getCloudNetworksByEms(function(data) {
      vm.available_networks = data.resources;
    })(id);
    miqService.getProviderTenants(function(data) {
      vm.available_tenants = data.resources;
    })(id);
  };

  init();
}]);
