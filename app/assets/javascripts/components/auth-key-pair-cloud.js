ManageIQ.angular.app.component('authKeyPairCloud', {
  controller: authKeyPairCloudController,
  controllerAs: 'vm',
  templateUrl: 'app/views/static/auth_key_pair_cloud.html.haml',

  bindings: {
    keyPairFormId: '@'
  }
});


authKeyPairCloudController.$inject = ['miqService', 'API'];

function authKeyPairCloudController(miqService, API) {

  var init = function() {
    vm.keyPairModel = {
      name: '',
      public_key: '',
      ems_id: '',
    };

    console.log("ok")

    vm.authKeyPairCloudModel = {
      formId: vm.keyPairFormId,
      afterGet: false,
      modelCopy: angular.copy( vm.keyPairModel ),
      model: 'keyPairModel',
      ems_choices: [],
      saveable: miqService.saveable,
      newRecord: vm.keyPairFormId == 'new'
    }

      ManageIQ.angular.scope = vm;

      miqService.sparkleOn();
      $http.get('/auth_key_pair_cloud/ems_form_choices')
        .then(getAuthKeyPairCloudFormDataComplete)
        .catch(miqService.handleFailure);
    };

    var keyPairEditButtonClicked = function(buttonName, serializeFields) {
      miqService.sparkleOn();

      var url = '/auth_key_pair_cloud/create/' + keyPairFormId + '?button=' + buttonName;
      //vm.keyPairModel.ems_id = vm.keyPairModel.ems.id;
      if (serializeFields) {
        miqService.miqAjaxButton(url, miqService.serializeModel(vm.keyPairModel), { complete: false });
      } else {
        miqService.miqAjaxButton(url);
      }
    };

    vm.cancelClicked = function() {
      keyPairEditButtonClicked('cancel', false);
      $scope.angularForm.$setPristine(true);
    };

    vm.resetClicked = function() {
      vm.keyPairModel = angular.copy( vm.modelCopy );
      $scope.angularForm.$setPristine(true);
      miqService.miqFlash("warn", __("All changes have been reset"));
    };

    vm.saveClicked = function() {
      keyPairEditButtonClicked('save', true);
    };

    vm.addClicked = vm.saveClicked;

    function getAuthKeyPairCloudFormDataComplete(response) {
      var data = response.data;

      vm.ems_choices = data.ems_choices;
      if (vm.ems_choices.length > 0) {
        vm.keyPairModel.ems = vm.ems_choices[0];
      }

      vm.afterGet = true;
      miqService.sparkleOff();
    }
}
