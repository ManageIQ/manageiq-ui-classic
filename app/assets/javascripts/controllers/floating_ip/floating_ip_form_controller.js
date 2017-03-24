ManageIQ.angular.app.controller('floatingIpFormController', ['$http', '$scope', 'floatingIpFormId', 'miqService', function($http, $scope, floatingIpFormId, miqService) {
  var vm = this;
    vm.floatingIpModel = { name: '' };
    vm.formId = floatingIpFormId;
    vm.afterGet = false;
    vm.modelCopy = angular.copy( vm.floatingIpModel );
    vm.model = "floatingIpModel";

  ManageIQ.angular.scope = vm;

  if (floatingIpFormId == 'new') {
      vm.floatingIpModel.name = "";
      vm.floatingIpModel.description = "";
      vm.newRecord = true;
  } else {
    miqService.sparkleOn();

    $http.get('/floating_ip/floating_ip_form_fields/' + floatingIpFormId)
      .then(getFloatingIpFormData)
      .catch(miqService.handleFailure);
  }

    $scope.addClicked = function() {
    var url = 'create/new' + '?button=add';
    miqService.miqAjaxButton(url, vm.floatingIpModel, { complete: false });
  };

    $scope.cancelClicked = function() {
    if (floatingIpFormId == 'new') {
      var url = '/floating_ip/create/new' + '?button=cancel';
    } else {
      var url = '/floating_ip/update/' + floatingIpFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

    $scope.saveClicked = function() {
    var url = '/floating_ip/update/' + floatingIpFormId + '?button=save';
    miqService.miqAjaxButton(url, vm.floatingIpModel, { complete: false });
  };

    $scope.resetClicked = function() {
        vm.floatingIpModel = angular.copy( vm.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", "All changes have been reset");
  };

    vm.filterNetworkManagerChanged = function(id) {
    miqService.sparkleOn();
    $http.get('/floating_ip/networks_by_ems/' + id)
      .then(getNetworkByEmsFormData)
      .catch(miqService.handleFailure);
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
