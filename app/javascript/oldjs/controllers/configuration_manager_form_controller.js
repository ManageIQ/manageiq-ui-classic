ManageIQ.angular.app.controller('configurationManagerFormController', ['$http', '$scope', 'configurationManagerFormId', 'miqService', 'configurationManagerService', 'url', function($http, $scope, configurationManagerFormId, miqService, configurationManagerService, url) {
  var vm = this;

  vm.configurationManagerModel = angular.copy(configurationManagerService.managerModel);
  vm.postValidationModel = {};
  vm.formId = configurationManagerFormId;
  vm.model = 'configurationManagerModel';
  vm.afterGet = false;
  vm.saveable = miqService.saveable;
  vm.modelCopy = angular.copy(vm.configurationManagerModel);
  vm.checkAuthentication = true;
  vm.validationUrl = url + '/authentication_validate/' + configurationManagerFormId + '?button=validate';
  vm.prefix = 'default';

  ManageIQ.angular.scope = $scope;

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
    vm.configurationManagerModel.zone_hidden = data.zone_hidden;
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

  vm.validateClicked = function() {
    var event = {target: '.validate_button:visible'};
    miqService.validateWithREST(event, vm.prefix, vm.validationUrl, true)
      .then(function success(data) {
        vm.configurationManagerModel.default_auth_status = data.level !== 'error';
        miqService.miqFlash(data.level, data.message);
        miqService.sparkleOff();
      });
  };

  vm.canValidateBasicInfo = function() {
    return vm.isBasicInfoValid();
  };

  vm.isBasicInfoValid = function() {
    return $scope.angularForm.url.$valid;
  };

  var editButtonClicked = function(buttonName, serializeFields) {
    miqService.sparkleOn();

    var editUrl = url + '/edit/' + configurationManagerFormId + '?button=' + buttonName;
    if (!serializeFields) {
      miqService.miqAjaxButton(editUrl);
    } else {
      miqService.miqAjaxButton(editUrl, serializeFields);
    }
  };

  vm.cancelClicked = function() {
    editButtonClicked('cancel');
  };

  vm.resetClicked = function() {
    $scope.$broadcast('resetClicked');
    vm.configurationManagerModel = angular.copy(vm.modelCopy);
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.saveClicked = function() {
    editButtonClicked('save', true);
  };

  vm.addClicked = function() {
    vm.saveClicked();
  };

  vm.postValidationModelRegistry = function(prefix) {
    configurationManagerService.postValidationModelRegistry(prefix, vm.newRecord, vm.postValidationModel, vm.configurationManagerModel);
  };
}]);
