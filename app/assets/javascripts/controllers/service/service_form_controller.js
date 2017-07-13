ManageIQ.angular.app.controller('serviceFormController', ['$http', '$scope', 'serviceFormId', 'miqService', function($http, $scope, serviceFormId, miqService) {
  var vm = this;

  var init = function() {
    vm.serviceModel = {
      name: '',
      description: '',
    };
    vm.formId    = serviceFormId;
    vm.afterGet  = false;
    vm.newRecord = false;
    vm.modelCopy = Object.assign({}, vm.serviceModel);
    vm.model     = 'serviceModel';
    vm.saveable  = miqService.saveable;

    ManageIQ.angular.scope = vm;

    miqService.sparkleOn();
    $http.get('/service/service_form_fields/' + serviceFormId)
        .then(getServiceFormData)
        .catch(miqService.handleFailure);
  };

  var serviceEditButtonClicked = function(buttonName, serializeFields) {
    miqService.sparkleOn();
    var url = '/service/service_edit/' + serviceFormId + '?button=' + buttonName;

    miqService.miqAjaxButton(url, serializeFields);
  };

  vm.cancelClicked = function() {
    serviceEditButtonClicked('cancel');
  };

  vm.resetClicked = function() {
    vm.serviceModel = Object.assign({}, vm.modelCopy);
    $scope.angularForm.$setUntouched(true);
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.saveClicked = function() {
    serviceEditButtonClicked('save', vm.serviceModel);
  };

  function getServiceFormData(response) {
    var data = response.data;
    vm.serviceModel = Object.assign({}, data);
    vm.afterGet = true;
    vm.modelCopy = Object.assign({}, vm.serviceModel);
  }

  init();
}]);
