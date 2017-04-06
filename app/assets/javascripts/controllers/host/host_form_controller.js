ManageIQ.angular.app.controller('hostFormController', ['$http', '$scope', '$attrs', 'hostFormId', 'miqService', function($http, $scope, $attrs, hostFormId, miqService) {
  var vm = this;

  var init = function() {
    vm.hostModel = {
      name: '',
      hostname: '',
      ipmi_address: '',
      custom_1: '',
      user_assigned_os: '',
      operating_system: false,
      mac_address: '',
      default_userid: '',
      default_password: '',
      default_verify: '',
      remote_userid: '',
      remote_password: '',
      remote_verify: '',
      ws_userid: '',
      ws_password: '',
      ws_verify: '',
      ipmi_userid: '',
      ipmi_password: '',
      ipmi_verify: '',
      validate_id: '',
    };

    vm.modelCopy = angular.copy( vm.hostModel );
    vm.afterGet = false;
    vm.formId = hostFormId;
    vm.validateClicked = miqService.validateWithAjax;
    vm.formFieldsUrl = $attrs.formFieldsUrl;
    vm.createUrl = $attrs.createUrl;
    vm.updateUrl = $attrs.updateUrl;
    vm.model = "hostModel";
    ManageIQ.angular.scope = vm;

    if (hostFormId == 'new') {
      vm.newRecord = true;
      vm.hostModel.name = "";
      vm.hostModel.hostname = "";
      vm.hostModel.ipmi_address = "";
      vm.hostModel.custom_1 = "";
      vm.hostModel.user_assigned_os = "";
      vm.hostModel.operating_system = false;
      vm.hostModel.mac_address = "";
      vm.hostModel.default_userid = "";
      vm.hostModel.default_password = "";
      vm.hostModel.default_verify = "";
      vm.hostModel.remote_userid = "";
      vm.hostModel.remote_password = "";
      vm.hostModel.remote_verify = "";
      vm.hostModel.ws_userid = "";
      vm.hostModel.ws_password = "";
      vm.hostModel.ws_verify = "";
      vm.hostModel.ipmi_userid = "";
      vm.hostModel.ipmi_password = "";
      vm.hostModel.ipmi_verify = "";
      vm.hostModel.validate_id = "";
      vm.afterGet = true;
    } else if (hostFormId.split(",").length == 1) {
        miqService.sparkleOn();
        $http.get(vm.formFieldsUrl + hostFormId)
          .then(getHostFormDataComplete)
          .catch(miqService.handleFailure);
     } else if (hostFormId.split(",").length > 1) {
      vm.afterGet = true;
    }

     vm.currentTab = "default";
  };

  $scope.changeAuthTab = function(id) {
    vm.currentTab = id;
  }

  $scope.addClicked = function() {
    miqService.sparkleOn();
    var url = 'create/new' + '?button=add';
    miqService.miqAjaxButton(url, true);
  };

  $scope.cancelClicked = function() {
    miqService.sparkleOn();
    if (hostFormId == 'new') {
      var url = vm.createUrl + 'new?button=cancel';
    } else if (hostFormId.split(",").length == 1) {
      var url = vm.updateUrl + hostFormId + '?button=cancel';
    } else if (hostFormId.split(",").length > 1) {
      var url = vm.updateUrl + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  $scope.saveClicked = function() {
    miqService.sparkleOn();
    if (hostFormId.split(",").length > 1) {
      var url = vm.updateUrl + '?button=save';
    } else {
      var url = vm.updateUrl + hostFormId + '?button=save';
    }
    miqService.miqAjaxButton(url, vm.hostModel);
  };

  $scope.resetClicked = function() {
    $scope.$broadcast ('resetClicked');
    vm.hostModel = angular.copy( vm.modelCopy );
    $scope.angularForm.$setUntouched(true);
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  vm.isBasicInfoValid = function() {
    if((vm.currentTab == "default") &&
      (vm.hostModel.hostname || vm.hostModel.validate_id) &&
      (vm.hostModel.default_userid != '' && $scope.angularForm.default_userid.$valid &&
      $scope.angularForm.default_password.$valid &&
      $scope.angularForm.default_verify.$valid)) {
      return true;
    } else if((vm.currentTab == "remote") &&
      (vm.hostModel.hostname || vm.hostModel.validate_id) &&
      (vm.hostModel.remote_userid != '' && $scope.angularForm.remote_userid.$valid &&
      $scope.angularForm.remote_password.$valid &&
      $scope.angularForm.remote_verify.$valid)) {
      return true;
    } else if((vm.currentTab == "ws") &&
      (vm.hostModel.hostname || vm.hostModel.validate_id) &&
      (vm.hostModel.ws_userid != '' && $scope.angularForm.ws_userid.$valid &&
      $scope.angularForm.ws_password.$valid &&
      $scope.angularForm.ws_verify.$valid)) {
      return true;
    } else if((vm.currentTab == "ipmi") &&
      (vm.hostModel.ipmi_address) &&
      (vm.hostModel.ipmi_userid != '' && $scope.angularForm.ipmi_userid.$valid &&
      $scope.angularForm.ipmi_password.$valid &&
      $scope.angularForm.ipmi_verify.$valid)) {
      return true;
    } else
      return false;
  };

  vm.canValidate = function () {
    if (vm.isBasicInfoValid() && vm.validateFieldsDirty())
      return true;
    else
      return false;
  }

  vm.canValidateBasicInfo = function () {
    if (vm.isBasicInfoValid())
      return true;
    else
      return false;
  }

  vm.validateFieldsDirty = function () {
    if((vm.currentTab == "default") &&
      (($scope.angularForm.hostname.$dirty || $scope.angularForm.validate_id.$dirty) &&
      $scope.angularForm.default_userid.$dirty &&
      $scope.angularForm.default_password.$dirty &&
      $scope.angularForm.default_verify.$dirty)) {
      return true;
    } else if((vm.currentTab == "remote") &&
      (($scope.angularForm.hostname.$dirty || $scope.angularForm.validate_id.$dirty) &&
      $scope.angularForm.remote_userid.$dirty &&
      $scope.angularForm.remote_password.$dirty &&
      $scope.angularForm.remote_verify.$dirty)) {
      return true;
    } else if((vm.currentTab == "ws") &&
      (($scope.angularForm.hostname.$dirty || $scope.angularForm.validate_id.$dirty) &&
      $scope.angularForm.ws_userid.$dirty &&
      $scope.angularForm.ws_password.$dirty &&
      $scope.angularForm.ws_verify.$dirty)) {
      return true;
    } else if((vm.currentTab == "ipmi") &&
      ($scope.angularForm.ipmi_address.$dirty &&
      $scope.angularForm.ipmi_userid.$dirty &&
      $scope.angularForm.ipmi_password.$dirty &&
      $scope.angularForm.ipmi_verify.$dirty)) {
      return true;
    } else
      return false;
  }

  function getHostFormDataComplete(response) {
    var data = response.data;

    Object.assign(vm.hostModel, data);

    if (vm.hostModel.default_userid !== '') {
      vm.hostModel.default_password = vm.hostModel.default_verify = miqService.storedPasswordPlaceholder;
    }
    if (vm.hostModel.remote_userid !== '') {
      vm.hostModel.remote_password = vm.hostModel.remote_verify = miqService.storedPasswordPlaceholder;
    }
    if (vm.hostModel.ws_userid !== '') {
      vm.hostModel.ws_password = vm.hostModel.ws_verify = miqService.storedPasswordPlaceholder;
    }
    if (vm.hostModel.ipmi_userid !== '') {
      vm.hostModel.ipmi_password = vm.hostModel.ipmi_verify = miqService.storedPasswordPlaceholder;
    }

    vm.afterGet = true;

    vm.modelCopy = angular.copy( vm.hostModel );
    miqService.sparkleOff();
  }

  init();
}]);
