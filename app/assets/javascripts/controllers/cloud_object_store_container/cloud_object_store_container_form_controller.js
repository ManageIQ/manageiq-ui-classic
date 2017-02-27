ManageIQ.angular.app.controller('cloudObjectStoreContainerFormController', ['$scope', 'miqService', 'API', function($scope, miqService, API) {
  var init = function() {
    $scope.cloudContainerModel = {
      name: '',
      emstype: '',
      parent_emstype: '',
      storage_manager_id: '',
      provider_region: '',
    };
    $scope.afterGet = false;
    $scope.modelCopy = angular.copy( $scope.cloudContainerModel );
    $scope.model = 'cloudContainerModel';
    $scope.newRecord = true;

    ManageIQ.angular.scope = $scope;
  };

  $scope.addClicked = function() {
    var url = 'create' + '?button=add';
    miqService.miqAjaxButton(url, $scope.cloudContainerModel, { complete: false });
  };

  $scope.cancelClicked = function() {
    miqService.miqAjaxButton('/cloud_object_store_container/create?button=cancel');
  };

  $scope.storageManagerChanged = function(id) {
    miqService.sparkleOn();

    API.get('/api/providers/' + id + '?attributes=type,parent_manager.type')
      .then(getStorageManagerFormDataComplete)
      .catch(miqService.handleFailure);
  };

  function getStorageManagerFormDataComplete(data) {
    $scope.afterGet = true;
    $scope.cloudContainerModel.emstype = data.type;
    $scope.cloudContainerModel.parent_emstype = data.parent_manager.type;

    miqService.sparkleOff();
  }

  init();
}]);
