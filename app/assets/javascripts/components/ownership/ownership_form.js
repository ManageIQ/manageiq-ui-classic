ManageIQ.angular.app.component('ownershipForm', {
  bindings: {
    recordIds: '<',
    optionsUser: '<',
    optionsGroup: '<',
  },

  controllerAs: 'vm',
  controller: ['$http', 'miqService', '$scope',  function($http, miqService, $scope) {
    var vm = this;

    vm.$onInit = function () {
        vm.ownershipModel = {
          user: '',
          group: '',
        };
        vm.afterGet  = false;
        vm.newRecord = false;
        vm.modelCopy = angular.copy( vm.ownershipModel );
        vm.model     = "ownershipModel";
        vm.saveable = miqService.saveable;
        ManageIQ.angular.scope = vm;
        miqService.sparkleOn();
        $http.post('ownership_form_fields', {object_ids: vm.recordIds})
          .then(getOwnershipFormData)
          .catch(miqService.handleFailure);
      };

      var ownershipEditButtonClicked = function(buttonName, serializeFields) {
        miqService.sparkleOn();
        var url = 'ownership_update/?button=' + buttonName;
        if (serializeFields === undefined) {
          miqService.miqAjaxButton(url);
        } else {
          miqService.miqAjaxButton(url, {
            objectIds: vm.recordIds,
            user: vm.ownershipModel.user,
            group: vm.ownershipModel.group,
          });
        }
      };

      function getOwnershipFormData(response) {
        var data = response.data;
        // if value null change it to empty string to match with values in select
        vm.ownershipModel.user = data.user === null ? '' : data.user;
        vm.ownershipModel.group = data.group === null ? '' : data.group;
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
      };

      vm.resetClicked = function(angularForm) {
        vm.ownershipModel = angular.copy( vm.modelCopy );
        angularForm.$setPristine(true);
        miqService.miqFlash("warn", __("All changes have been reset"));
      };

      vm.saveClicked = function() {
        ownershipEditButtonClicked('save', true);
      };
  }],

  templateUrl: '/static/shared/ownership.html.haml',
});
