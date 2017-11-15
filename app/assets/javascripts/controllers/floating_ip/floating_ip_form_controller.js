ManageIQ.angular.app.controller('floatingIpFormController', ['floatingIpFormId', 'miqService', 'API', function(floatingIpFormId, miqService, API) {
  var vm = this;

  var init = function() {
    vm.afterGet = false;

    vm.floatingIpModel = { address: null };
    vm.available_ems = null;

    vm.formId = floatingIpFormId;
    vm.model = "floatingIpModel";
    vm.newRecord = floatingIpFormId === "new";
    vm.saveable = miqService.saveable;

    miqService.sparkleOn();
    if (vm.newRecord) {
      API.get("/api/providers?expand=resources&attributes=name&filter[]=type='*NetworkManager'").then(function(data) {
        vm.available_ems = data.resources;
        vm.afterGet = true;
        vm.modelCopy = angular.copy(vm.floatingIpModel);
        miqService.sparkleOff();
      }).catch(miqService.handleFailure);
    } else {
      API.get("/api/floating_ips/" +  floatingIpFormId + "?attributes=cloud_network,cloud_tenant,ext_management_system,network_port").then(function(data) {
        Object.assign(vm.floatingIpModel, data);
        vm.afterGet = true;
        vm.modelCopy = angular.copy(vm.floatingIpModel);
        miqService.sparkleOff();
      }).catch(miqService.handleFailure);
    }
  };

  vm.addClicked = function() {
    var url = 'create/new?button=add';
    miqService.miqAjaxButton(url, vm.floatingIpModel, { complete: false });
  };

  vm.cancelClicked = function() {
    if (floatingIpFormId == 'new') {
      var url = '/floating_ip/create/new?button=cancel';
    } else {
      var url = '/floating_ip/update/' + floatingIpFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  vm.saveClicked = function() {
    var url = '/floating_ip/update/' + floatingIpFormId + '?button=save';
    miqService.miqAjaxButton(url, vm.floatingIpModel, { complete: false });
  };

  vm.resetClicked = function() {
    vm.floatingIpModel = angular.copy( vm.modelCopy );
    vm.angularForm.$setPristine(true);
    miqService.miqFlash("warn", "All changes have been reset");
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
