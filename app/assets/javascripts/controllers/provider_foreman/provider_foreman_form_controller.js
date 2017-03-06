ManageIQ.angular.app.controller('providerForemanFormController', ['$http', '$scope', 'providerForemanFormId', 'miqService', function($http, $scope, providerForemanFormId, miqService) {
  var vm = this;

  vm.providerForemanModel = {
    provtype: '',
    name: '',
    url: '',
    zone: '',
    verify_ssl: '',
    log_userid: '',
    log_password: '',
    log_verify: ''
  };

  vm.formId = providerForemanFormId;
  vm.afterGet = false;
  vm.validateClicked = miqService.validateWithAjax;
  vm.modelCopy = angular.copy( vm.providerForemanModel );
  vm.model = 'providerForemanModel';

  vm.saveable = miqService.saveable;

  ManageIQ.angular.scope = vm;


  if (providerForemanFormId == 'new') {
    vm.newRecord = true;

    $http.get('/provider_foreman/provider_foreman_form_fields/' + providerForemanFormId)
      .then(getProviderForemanFormData)
      .catch(miqService.handleFailure);
  } else {
    vm.newRecord = false;

    miqService.sparkleOn();

    $http.get('/provider_foreman/provider_foreman_form_fields/' + providerForemanFormId)
      .then(getProviderForemanFormData)
      .catch(miqService.handleFailure);
  }

  vm.canValidateBasicInfo = function (angularForm) {
    if (vm.isBasicInfoValid(angularForm))
      return true;
    else
      return false;
  }

  vm.isBasicInfoValid = function(angularForm) {
    if(angularForm.url.$valid &&
      angularForm.log_userid.$valid &&
      angularForm.log_password.$valid &&
      angularForm.log_verify.$valid)
      return true;
    else
      return false;
  };

  var providerForemanEditButtonClicked = function(buttonName, serializeFields) {
    miqService.sparkleOn();
    var url = '/provider_foreman/edit/' + providerForemanFormId + '?button=' + buttonName;
    if (serializeFields === undefined) {
      miqService.miqAjaxButton(url);
    } else {
      miqService.miqAjaxButton(url, serializeFields);
    }
  };

  vm.cancelClicked = function(angularForm) {
    providerForemanEditButtonClicked('cancel');
    angularForm.$setPristine(true);
  };

  vm.resetClicked = function(angularForm) {
    $scope.$broadcast ('resetClicked');
    vm.providerForemanModel = angular.copy( vm.modelCopy );
    angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  vm.saveClicked = function(angularForm) {
    providerForemanEditButtonClicked('save', true);
    angularForm.$setPristine(true);
  };

  vm.addClicked = function(angularForm) {
    vm.saveClicked(angularForm);
  };

  function getProviderForemanFormData(response) {
    var data = response.data;

    if (! vm.newRecord) {
      vm.providerForemanModel.provtype = data.provtype;
      vm.providerForemanModel.name = data.name;
      vm.providerForemanModel.url = data.url;
      vm.providerForemanModel.verify_ssl = data.verify_ssl === 1;

      vm.providerForemanModel.log_userid = data.log_userid;

      if (vm.providerForemanModel.log_userid !== '') {
        vm.providerForemanModel.log_password = vm.providerForemanModel.log_verify = miqService.storedPasswordPlaceholder;
      }
    }

    vm.providerForemanModel.zone = data.zone;
    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.providerForemanModel );

    miqService.sparkleOff();
  }
}]);
