ManageIQ.angular.app.controller('ownershipFormController', ['$http', '$scope', 'objectIds', 'miqService', function($http, $scope, objectIds, miqService) {
  var vm = this;
  var init = function() {
    vm.ownershipModel = {
      user: '',
      group: '',
    };
    vm.afterGet  = false;
    vm.newRecord = false;
    vm.modelCopy = angular.copy( vm.ownershipModel );
    vm.model     = 'ownershipModel';
    vm.objectIds = objectIds;
    vm.saveable = miqService.saveable;

    ManageIQ.angular.scope = vm;

    miqService.sparkleOn();
    $http.post('ownership_form_fields', {object_ids: objectIds})
      .then(getOwnershipFormData)
      .catch(miqService.handleFailure);
  };

  $scope.canValidateBasicInfo = function() {
    return vm.isBasicInfoValid();
  };

  vm.isBasicInfoValid = function() {
    return ( $scope.angularForm.user && $scope.angularForm.user.$valid) &&
          ($scope.angularForm.group && $scope.angularForm.group.$valid);
  };


  var ownershipEditButtonClicked = function(buttonName, serializeFields) {
    miqService.sparkleOn();
    var url = 'ownership_update/' + '?button=' + buttonName;
    if (serializeFields === undefined) {
      miqService.miqAjaxButton(url);
    } else {
      miqService.miqAjaxButton(url, {
        objectIds: vm.objectIds,
        user: vm.ownershipModel.user,
        group: vm.ownershipModel.group,
      });
    }
  };

  $scope.cancelClicked = function() {
    ownershipEditButtonClicked('cancel');
    $scope.angularForm.$setPristine(true);
  };

  $scope.resetClicked = function() {
    vm.ownershipModel = angular.copy( vm.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  $scope.saveClicked = function() {
    ownershipEditButtonClicked('save', true);
  };

  $scope.addClicked = function() {
    $scope.saveClicked();
  };

  function getOwnershipFormData(response) {
    var data = response.data;

    vm.ownershipModel.user = data.user;
    vm.ownershipModel.group = data.group;
    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.ownershipModel );
    miqService.sparkleOff();
  }

  init();
}]);
