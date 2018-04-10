ManageIQ.angular.app.controller('floatingIpFormController', ['$http', '$scope', 'floatingIpFormId', 'miqService', 'emsChoices', function($http, $scope, floatingIpFormId, miqService, emsChoices) {
  var vm = this;
  vm.floatingIpModel = { floating_ip_address: '' };
  vm.formId = floatingIpFormId;
  vm.afterGet = false;
  vm.modelCopy = angular.copy( vm.floatingIpModel );
  vm.model = "floatingIpModel";
  vm.emsChoices = emsChoices;

  ManageIQ.angular.scope = vm;
  vm.saveable = miqService.saveable;

  if (floatingIpFormId == 'new') {
    vm.floatingIpModel.floating_ip_address = "";
    vm.floatingIpModel.description = "";
    vm.newRecord = true;
  } else {
    miqService.sparkleOn();

    $http.get('/floating_ip/floating_ip_form_fields/' + floatingIpFormId)
      .then(getFloatingIpFormData)
      .catch(miqService.handleFailure);
  }

  vm.addClicked = function() {
    var url = 'create/new' + '?button=add';
    miqService.miqAjaxButton(url, vm.floatingIpModel, { complete: false });
  };

  vm.cancelClicked = function() {
    if (floatingIpFormId == 'new') {
      var url = '/floating_ip/create/new' + '?button=cancel';
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
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", "All changes have been reset");
  };

  vm.filterNetworkManagerChanged = function(id) {
    miqService.sparkleOn();
    $http.get('/floating_ip/networks_by_ems/' + id)
      .then(getNetworkByEmsFormData)
      .catch(miqService.handleFailure);

    miqService.getProviderTenants(function(data) {
      vm.available_tenants = data.resources;
    })(id);
  };

  function getFloatingIpFormData(response) {
    var data = response.data;

    vm.afterGet = true;
    vm.floatingIpModel.network_port_ems_ref = data.network_port_ems_ref;
    vm.modelCopy = angular.copy( vm.floatingIpModel );
    miqService.sparkleOff();
  }

  function getNetworkByEmsFormData(response) {
    var data = response.data;

    vm.available_networks = data.available_networks;
    miqService.sparkleOff();
  }
}]);
