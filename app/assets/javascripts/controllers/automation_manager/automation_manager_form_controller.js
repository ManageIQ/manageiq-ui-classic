ManageIQ.angular.app.controller('automationManagerFormController', ['$http', '$scope', 'automationManagerFormId', 'miqService', function($http, $scope, automationManagerFormId, miqService) {
  var vm = this;

  vm.automationManagerModel = {
    name: '',
    url: '',
    zone: '',
    verify_ssl: '',
    log_userid: '',
    log_password: '',
  };
  vm.formId = automationManagerFormId;
  vm.afterGet = false;
  vm.validateClicked = miqService.validateWithAjax;
  vm.saveable = miqService.saveable;
  vm.modelCopy = angular.copy(vm.automationManagerModel);
  vm.model = 'automationManagerModel';

  ManageIQ.angular.scope = vm;

  miqService.sparkleOn();
  if (automationManagerFormId === 'new') {
    vm.newRecord = true;

    vm.automationManagerModel.name = '';
    vm.automationManagerModel.url = '';
    vm.automationManagerModel.verify_ssl = false;
    vm.automationManagerModel.log_userid = '';
    vm.automationManagerModel.log_password = '';

    $http.get('/automation_manager/form_fields/' + automationManagerFormId)
      .then(getAutomationManagerNewFormDataComplete)
      .catch(miqService.handleFailure);
  } else {
    vm.newRecord = false;

    $http.get('/automation_manager/form_fields/' + automationManagerFormId)
      .then(getAutomationManagerFormDataComplete)
      .catch(miqService.handleFailure);
  }

  function getAutomationManagerNewFormDataComplete(response) {
    var data = response.data;

    vm.automationManagerModel.zone = data.zone;

    vm.modelCopy = angular.copy(vm.automationManagerModel);
    vm.afterGet = true;
    miqService.sparkleOff();
  }

  function getAutomationManagerFormDataComplete(response) {
    var data = response.data;

    vm.automationManagerModel.name = data.name;
    vm.automationManagerModel.zone = data.zone;
    vm.automationManagerModel.url = data.url;
    vm.automationManagerModel.verify_ssl = data.verify_ssl == "1";
    vm.automationManagerModel.log_userid = data.log_userid;

    if (vm.automationManagerModel.log_userid != '') {
      vm.automationManagerModel.log_password = miqService.storedPasswordPlaceholder;
    }

    vm.modelCopy = angular.copy(vm.automationManagerModel);
    vm.afterGet = true;
    miqService.sparkleOff();
  }

  vm.canValidateBasicInfo = function() {
    return vm.isBasicInfoValid();
  };

  vm.isBasicInfoValid = function() {
    return $scope.angularForm.url.$valid &&
      $scope.angularForm.authCredentialsForm.log_userid.$valid &&
      $scope.angularForm.authCredentialsForm.log_password.$valid;
  };

  var automationManagerEditButtonClicked = function(buttonName, serializeFields) {
    miqService.sparkleOn();

    var url = '/automation_manager/edit/' + automationManagerFormId + '?button=' + buttonName;
    if (serializeFields === undefined) {
      miqService.miqAjaxButton(url);
    } else {
      miqService.miqAjaxButton(url, serializeFields);
    }
  };

  vm.cancelClicked = function() {
    automationManagerEditButtonClicked('cancel');
    $scope.angularForm.$setPristine(true);
  };

  vm.resetClicked = function() {
    $scope.$broadcast('resetClicked');
    vm.automationManagerModel = angular.copy(vm.modelCopy);
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.saveClicked = function() {
    automationManagerEditButtonClicked('save', true);
    $scope.angularForm.$setPristine(true);
  };

  vm.addClicked = function() {
    vm.saveClicked();
  };
}]);
