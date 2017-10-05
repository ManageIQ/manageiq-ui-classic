ManageIQ.angular.app.controller('configurationManagerFormController', ['$http', '$scope', 'configurationManagerFormId', 'miqService', 'configurationManagerService', 'url', function($http, $scope, configurationManagerFormId, miqService, configurationManagerService, url) {
  var vm = this;

  vm.configurationManagerModel = angular.copy(configurationManagerService.managerModel);

  vm.postValidationModel = {};

  vm.formId = configurationManagerFormId;
  vm.afterGet = false;
  vm.saveable = miqService.saveable;
  vm.validateClicked = configurationManagerService.validateClicked;
  vm.modelCopy = angular.copy(vm.configurationManagerModel);
  vm.model = 'configurationManagerModel';
  vm.checkAuthentication = true;

  ManageIQ.angular.scope = vm;

  miqService.sparkleOn();
  if (configurationManagerFormId === 'new') {
    vm.newRecord = true;

    vm.configurationManagerModel.name = '';
    vm.configurationManagerModel.url = '';
    vm.configurationManagerModel.verify_ssl = false;
    vm.configurationManagerModel.default_userid = '';
    vm.configurationManagerModel.default_password = '';

    $http.get(url + '/form_fields/' + configurationManagerFormId)
      .then(newFormDataComplete)
      .catch(miqService.handleFailure);
  } else {
    vm.newRecord = false;

    $http.get(url + '/form_fields/' + configurationManagerFormId)
      .then(editFormDataComplete)
      .catch(miqService.handleFailure);
  }

  function newFormDataComplete(response) {
    var data = response.data;

    vm.configurationManagerModel.zone = data.zone;

    vm.modelCopy = angular.copy(vm.configurationManagerModel);
    vm.afterGet = true;
    miqService.sparkleOff();
  }

  function editFormDataComplete(response) {
    var data = response.data;

    vm.configurationManagerModel.name = data.name;
    vm.configurationManagerModel.zone = data.zone;
    vm.configurationManagerModel.url = data.url;
    vm.configurationManagerModel.verify_ssl = data.verify_ssl === 1;
    vm.configurationManagerModel.default_userid = data.default_userid;
    vm.configurationManagerModel.default_auth_status = data.default_auth_status;

    if (vm.configurationManagerModel.default_userid !== '') {
      vm.configurationManagerModel.default_password = miqService.storedPasswordPlaceholder;
    }

    vm.modelCopy = angular.copy(vm.configurationManagerModel);
    vm.afterGet = true;
    miqService.sparkleOff();
  }

  vm.canValidateBasicInfo = function() {
    return vm.isBasicInfoValid();
  };

  vm.isBasicInfoValid = function() {
    return $scope.angularForm.url.$valid &&
      $scope.angularForm.default_userid.$valid &&
      $scope.angularForm.default_password.$valid;
  };

  var editButtonClicked = function(buttonName, serializeFields) {
    miqService.sparkleOn();

    var editUrl = url + '/edit/' + configurationManagerFormId + '?button=' + buttonName;
    if (! serializeFields) {
      miqService.miqAjaxButton(editUrl);
    } else {
      miqService.miqAjaxButton(editUrl, serializeFields);
    }
  };

  vm.cancelClicked = function() {
    editButtonClicked('cancel');
    $scope.angularForm.$setPristine(true);
  };

  vm.resetClicked = function() {
    $scope.$broadcast('resetClicked');
    vm.configurationManagerModel = angular.copy(vm.modelCopy);
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.saveClicked = function() {
    editButtonClicked('save', true);
    $scope.angularForm.$setPristine(true);
  };

  vm.addClicked = function() {
    vm.saveClicked();
  };

  vm.postValidationModelRegistry = function(prefix) {
    configurationManagerService.postValidationModelRegistry(prefix, vm.newRecord, vm.postValidationModel, vm.configurationManagerModel);
  };
}]);
