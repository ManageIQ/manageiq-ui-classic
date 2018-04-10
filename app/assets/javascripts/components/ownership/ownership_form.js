ManageIQ.angular.app.component('ownershipFormComponent', {
  bindings: {
    objectIds: '<',
    optsUser:  '<',
    optsGroup: '<',
  },

  controllerAs: 'vm',
  controller: ['$http', 'miqService','$scope',  function($http, miqService,$scope){
   var vm = this;

  vm.$onInit = function () {

  console.log(vm.optsUser);
    vm.ownershipModel = {
      user: '',
      group: ''
    };
    vm.afterGet  = false;
    vm.newRecord = false;
    vm.modelCopy = angular.copy( vm.ownershipModel );
    vm.model     = "ownershipModel";
    vm.saveable = miqService.saveable;
    ManageIQ.angular.scope = vm;
    miqService.sparkleOn();
   $http.post('ownership_form_fields', {object_ids: vm.objectIds})
      .then(getOwnershipFormData)
      .catch(miqService.handleFailure);
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
        group: vm.ownershipModel.group
      });
    }
  };


  function getOwnershipFormData(response) {
    var data = response.data;
    vm.ownershipModel.user = data.user;
    vm.ownershipModel.group = data.group;
    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.ownershipModel );
    miqService.sparkleOff();
  }

  vm.isBasicInfoValid = function() {
    return ( $scope.angularForm.user && $scope.angularForm.user.$valid) &&
          ($scope.angularForm.group && $scope.angularForm.group.$valid);
  };


  vm.cancelClicked = function() {
    ownershipEditButtonClicked('cancel');
    $scope.angularForm.$setPristine(true);
  };

  vm.resetClicked = function() {
    vm.ownershipModel = angular.copy( vm.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  vm.saveClicked = function() {
    ownershipEditButtonClicked('save', true);
  };

  vm.addClicked = function() {
    vm.saveClicked();
  };

  }],
  templateUrl: '/static/shared/ownership.html.haml',

})
