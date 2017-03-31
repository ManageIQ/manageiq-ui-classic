ManageIQ.angular.app.controller('keyPairCloudFormController', ['$http', '$scope', 'keyPairFormId', 'miqService', function($http, $scope, keyPairFormId, miqService) {
    var vm = this;
    var init = function() {
        vm.keyPairModel = {
            name: '',
            public_key: '',
            ems_id: ''
        };
        vm.formId = keyPairFormId;
        vm.afterGet = false;
        vm.modelCopy = angular.copy( vm.keyPairModel );
        vm.model = 'keyPairModel';
        vm.ems_choices = [];
        ManageIQ.angular.scope = $scope;

        miqService.sparkleOn();
        $http.get('/auth_key_pair_cloud/ems_form_choices')
          .then(getAuthKeyPairCloudFormDataComplete)
          .catch(miqService.handleFailure);

        if (keyPairFormId == 'new') {
            vm.newRecord = true;
        } else {
            vm.newRecord = false;
        }
    };

    var keyPairEditButtonClicked = function(buttonName, serializeFields) {
        miqService.sparkleOn();

        var url = '/auth_key_pair_cloud/create/' + keyPairFormId + '?button=' + buttonName;
        vm.keyPairModel.ems_id = vm.keyPairModel.ems.id;
        if(serializeFields) {
            miqService.miqAjaxButton(url, miqService.serializeModel(vm.keyPairModel));
        } else {
            miqService.miqAjaxButton(url, false);
        }
        miqService.sparkleOff();
    };

    $scope.cancelClicked = function() {
        keyPairEditButtonClicked('cancel', false);
        vm.angularForm.$setPristine(true);
    };

    $scope.resetClicked = function() {
        vm.keyPairModel = angular.copy( vm.modelCopy );
        vm.angularForm.$setPristine(true);
        miqService.miqFlash("warn", __("All changes have been reset"));
    };

    $scope.saveClicked = function() {
        keyPairEditButtonClicked('save', true);
        vm.angularForm.$setPristine(true);
    };

    $scope.addClicked = function() {
        vm.saveClicked();
    };

    function getAuthKeyPairCloudFormDataComplete(response) {
      var data = response.data;

      vm.ems_choices = data.ems_choices;
      if(vm.ems_choices.length > 0) {
        vm.keyPairModel.ems = vm.ems_choices[0];
      }
      vm.afterGet = true;
      miqService.sparkleOff();
    }

    init();
}]);
