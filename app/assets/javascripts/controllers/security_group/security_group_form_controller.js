ManageIQ.angular.app.controller('securityGroupFormController', ['$scope', 'securityGroupFormId', 'miqService', 'API', function($scope, securityGroupFormId, miqService, API) {
  $scope.securityGroupModel = { name: '' };
  $scope.formId = securityGroupFormId;
  $scope.afterGet = false;
  $scope.modelCopy = angular.copy( $scope.securityGroupModel );
  $scope.model = "securityGroupModel";

  ManageIQ.angular.scope = $scope;

  if (securityGroupFormId == 'new') {
    $scope.securityGroupModel.name = "";
    $scope.securityGroupModel.description = "";
    $scope.newRecord = true;
  } else {
    miqService.sparkleOn();
    API.get("/api/security_groups/" + securityGroupFormId + "?attributes=cloud_tenant").then(function(data) {
      $scope.afterGet = true;
      $scope.securityGroupModel.name = data.name;
      $scope.securityGroupModel.description = data.description;
      $scope.securityGroupModel.cloud_tenant_name = data.cloud_tenant.name;
      $scope.modelCopy = angular.copy( $scope.securityGroupModel );
      miqService.sparkleOff();
    }).catch(miqService.handleFailure);
  }

  $scope.addClicked = function() {
    var url = 'create/new' + '?button=add';
    miqService.miqAjaxButton(url, $scope.securityGroupModel, { complete: false });
  };

  $scope.cancelClicked = function() {
    if (securityGroupFormId == 'new') {
      var url = '/security_group/create/new' + '?button=cancel';
    } else {
      var url = '/security_group/update/' + securityGroupFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  $scope.saveClicked = function() {
    var url = '/security_group/update/' + securityGroupFormId + '?button=save';
    miqService.miqAjaxButton(url, $scope.securityGroupModel, { complete: false });
  };

  $scope.resetClicked = function() {
    $scope.securityGroupModel = angular.copy( $scope.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", "All changes have been reset");
  };

  $scope.filterNetworkManagerChanged = miqService.getProviderTenants(function(data) {
    $scope.available_tenants = data.resources;
  });
}]);
