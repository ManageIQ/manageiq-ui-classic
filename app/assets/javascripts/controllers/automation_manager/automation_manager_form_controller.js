ManageIQ.angular.app.controller('automationManagerFormController', ['$http', '$scope', 'automationManagerFormId', 'miqService', function($http, $scope, automationManagerFormId, miqService) {
    var vm = this;

  vm.automationManagerModel = {
    name: '',
    url: '',
    zone: '',
    verify_ssl: '',
    log_userid: '',
    log_password: '',
    log_verify: '',
  };
  vm.formId = automationManagerFormId;
  vm.afterGet = false;
  vm.validateClicked = miqService.validateWithAjax;
  vm.modelCopy = $scope.modelCopy = angular.copy( vm.automationManagerModel );
  vm.model = 'automationManagerModel';

  ManageIQ.angular.scope = vm;

  if (automationManagerFormId === 'new') {
    vm.newRecord = true;

    vm.automationManagerModel.name = '';
    vm.automationManagerModel.url = '';
    vm.automationManagerModel.verify_ssl = false;
    vm.automationManagerModel.log_userid = '';
    vm.automationManagerModel.log_password = '';
    vm.automationManagerModel.log_verify = '';

    $http.get('/automation_manager/automation_manager_form_fields/' + automationManagerFormId)
      .then(getAutomationManagerNewFormDataComplete)
      .catch(miqService.handleFailure);
  } else {
    vm.newRecord = false;
    miqService.sparkleOn();

    $http.get('/automation_manager/automation_manager_form_fields/' + automationManagerFormId)
      .then(getAutomationManagerFormDataComplete)
      .catch(miqService.handleFailure);

    miqService.sparkleOff();
  }

  function getAutomationManagerNewFormDataComplete(response) {
    var data = response.data;
    vm.afterGet = true;
    vm.automationManagerModel.zone = data.zone;
      vm.modelCopy = $scope.modelCopy = angular.copy( vm.automationManagerModel );
  }

  function getAutomationManagerFormDataComplete(response) {
    var data = response.data;
    vm.afterGet = true;

    vm.automationManagerModel.name            = data.name;
    vm.automationManagerModel.zone            = data.zone;
    vm.automationManagerModel.url             = data.url;
    vm.automationManagerModel.verify_ssl      = data.verify_ssl == "1";

    vm.automationManagerModel.log_userid   = data.log_userid;

    if(vm.automationManagerModel.log_userid != '') {
      vm.automationManagerModel.log_password = vm.automationManagerModel.log_verify = miqService.storedPasswordPlaceholder;
    }
      vm.modelCopy = $scope.modelCopy = angular.copy( vm.automationManagerModel );
  }

  vm.canValidateBasicInfo = function() {
    if (vm.isBasicInfoValid()) {
      return true;
    }
    else {
      return false;
    }
  };

  vm.isBasicInfoValid = function() {
    if($scope.angularForm.url.$valid &&
        $scope.angularForm.log_userid.$valid &&
        $scope.angularForm.log_password.$valid &&
        $scope.angularForm.log_verify.$valid)
      return true;
    else
      return false;
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
    vm.$broadcast('resetClicked');
      vm.modelCopy = $scope.modelCopy = angular.copy( vm.automationManagerModel );
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
