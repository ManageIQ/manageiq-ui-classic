ManageIQ.angular.app.controller('cloudSubnetFormController', ['$scope', 'cloudSubnetFormId', 'miqService', 'API', function($scope, cloudSubnetFormId, miqService, API) {
  $scope.cloudSubnetModel = { name: '', ems_id: '', cloud_tenant_id: '', network_id: '' };
  $scope.formId = cloudSubnetFormId;
  $scope.afterGet = false;
  $scope.modelCopy = angular.copy( $scope.cloudSubnetModel );
  $scope.model = "cloudSubnetModel";

  ManageIQ.angular.scope = $scope;

  if (cloudSubnetFormId == 'new') {
    $scope.cloudSubnetModel.name = "";
    $scope.cloudSubnetModel.dhcp_enabled = true;
    $scope.cloudSubnetModel.network_protocol = '4';
    $scope.newRecord = true;
  } else {
    miqService.sparkleOn();
    API.get("/api/cloud_subnets/" + cloudSubnetFormId + "?expand=resources").then(function(data) {
      $scope.afterGet = true;
      $scope.cloudSubnetModel.name = data.name;
      $scope.cloudSubnetModel.dhcp_enabled = data.dhcp_enabled;
      $scope.cloudSubnetModel.cidr = data.cidr;
      $scope.cloudSubnetModel.gateway = data.gateway;
      $scope.cloudSubnetModel.network_protocol = data.extra_attributes.ip_version;
      $scope.modelCopy = angular.copy( $scope.cloudSubnetModel );
      miqService.sparkleOff();
    }).catch(miqService.handleFailure);
  }

  $scope.addClicked = function() {
    var url = 'create/new' + '?button=add';
    miqService.miqAjaxButton(url, $scope.cloudSubnetModel, { complete: false });
  };

  $scope.cancelClicked = function() {
    if (cloudSubnetFormId == 'new') {
      var url = '/cloud_subnet/create/new' + '?button=cancel';
    } else {
      var url = '/cloud_subnet/update/' + cloudSubnetFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  $scope.saveClicked = function() {
    var url = '/cloud_subnet/update/' + cloudSubnetFormId + '?button=save';
    miqService.miqAjaxButton(url, $scope.cloudSubnetModel, { complete: false });
  };

  $scope.resetClicked = function() {
    $scope.cloudSubnetModel = angular.copy( $scope.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", "All changes have been reset");
  };

  $scope.filterNetworkManagerChanged = function(id) {
    miqService.sparkleOn();
    if (id) {
      API.get("/api/cloud_networks?expand=resources&attributes=name,ems_ref&filter[]=ems_id=" + id).then(function(data) {
        $scope.available_networks = data.resources;
      }).catch(miqService.handleFailure);

      miqService.getProviderTenants(function(data) {
        $scope.available_tenants = data.resources;
      })(id);
    }
    miqService.sparkleOff();
  };
}]);
