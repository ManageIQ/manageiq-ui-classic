ManageIQ.angular.app.controller('cloudNetworkFormController', ['$scope', 'cloudNetworkFormId', 'miqService', 'API', function($scope, cloudNetworkFormId, miqService, API) {
  var vm = this;
  vm.cloudNetworkModel = { name: '', ems_id: '', cloud_tenant_id: '', provider_network_type: ''  };
  vm.formId = cloudNetworkFormId;
  vm.afterGet = false;
  vm.modelCopy = angular.copy( vm.cloudNetworkModel );
  vm.model = "cloudNetworkModel";

  ManageIQ.angular.scope = vm;

  if (cloudNetworkFormId == 'new') {
    vm.cloudNetworkModel.name = "";
    vm.newRecord = true;
    vm.cloudNetworkModel.enabled = true;
    vm.cloudNetworkModel.external_facing = false;
    vm.cloudNetworkModel.shared = false;
    vm.cloudNetworkModel.vlan_transparent = false;
  } else {
    miqService.sparkleOn();

  API.get("/api/cloud_networks/" + cloudNetworkFormId + "?attributes=cloud_tenant")
      .then(getCloudNetworkFormDataComplete)
      .catch(miqService.handleFailure);
  }

  function getCloudNetworkFormDataComplete(response) {
    var data = response.data;

    vm.afterGet = true;
    vm.cloudNetworkModel.name = $scope.cloudNetworkModel.name = data.name;
    vm.cloudNetworkModel.cloud_tenant_name = data.cloud_tenant_name;
    vm.cloudNetworkModel.enabled = data.enabled;
    vm.cloudNetworkModel.external_facing = data.external_facing;
    vm.cloudNetworkModel.port_security_enabled = data.port_security_enabled;
    vm.cloudNetworkModel.provider_network_type = $scope.cloudNetworkModel.provider_network_type  = data.provider_network_type;
    vm.cloudNetworkModel.qos_policy_id = data.qos_policy_id;
    vm.cloudNetworkModel.shared = data.shared;
    vm.cloudNetworkModel.vlan_transparent = data.vlan_transparent;
    vm.modelCopy = angular.copy( vm.cloudNetworkModel );
    miqService.sparkleOff();
  }

  $scope.addClicked = function() {
    var url = 'create/new' + '?button=add';
    miqService.miqAjaxButton(url, vm.cloudNetworkModel, { complete: false });
  };

  $scope.cancelClicked = function() {
    if (cloudNetworkFormId == 'new') {
      var url = '/cloud_network/create/new' + '?button=cancel';
    } else {
      var url = '/cloud_network/update/' + cloudNetworkFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  $scope.saveClicked = function() {
    var url = '/cloud_network/update/' + cloudNetworkFormId + '?button=save';
    miqService.miqAjaxButton(url, vm.cloudNetworkModel, { complete: false });
  };

  $scope.resetClicked = function() {
    vm.cloudNetworkModel = angular.copy( vm.modelCopy );
    vm.angularForm.$setPristine(true);
    miqService.miqFlash("warn", "All changes have been reset");
  };
}]);
