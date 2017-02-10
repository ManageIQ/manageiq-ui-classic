ManageIQ.angular.app.controller('hostFormController', ['$http', '$scope', '$attrs', 'hostFormId', 'miqService', function($http, vm, $attrs, hostFormId, miqService) {
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
    miqService.miqAjaxButton(url, true);
  };

  $scope.resetClicked = function() {
    vm.$broadcast ('resetClicked');
    vm.hostModel = angular.copy( vm.modelCopy );
    vm.angularForm.$setUntouched(true);
    vm.angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  vm.isBasicInfoValid = function() {
    if((vm.currentTab == "default") &&
      (vm.hostModel.hostname || vm.hostModel.validate_id) &&
      (vm.hostModel.default_userid != '' && vm.angularForm.default_userid.$valid &&
      vm.angularForm.default_password.$valid &&
      vm.angularForm.default_verify.$valid)) {
      return true;
    } else if((vm.currentTab == "remote") &&
      (vm.hostModel.hostname || vm.hostModel.validate_id) &&
      (vm.hostModel.remote_userid != '' && vm.angularForm.remote_userid.$valid &&
      vm.angularForm.remote_password.$valid &&
      vm.angularForm.remote_verify.$valid)) {
      return true;
    } else if((vm.currentTab == "ws") &&
      (vm.hostModel.hostname || vm.hostModel.validate_id) &&
      (vm.hostModel.ws_userid != '' && vm.angularForm.ws_userid.$valid &&
      vm.angularForm.ws_password.$valid &&
      vm.angularForm.ws_verify.$valid)) {
      return true;
    } else if((vm.currentTab == "ipmi") &&
      (vm.hostModel.ipmi_address) &&
      (vm.hostModel.ipmi_userid != '' && vm.angularForm.ipmi_userid.$valid &&
      vm.angularForm.ipmi_password.$valid &&
      vm.angularForm.ipmi_verify.$valid)) {
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
      ((vm.angularForm.hostname.$dirty || vm.angularForm.validate_id.$dirty) &&
      vm.angularForm.default_userid.$dirty &&
      vm.angularForm.default_password.$dirty &&
      vm.angularForm.default_verify.$dirty)) {
      return true;
    } else if((vm.currentTab == "remote") &&
      ((vm.angularForm.hostname.$dirty || vm.angularForm.validate_id.$dirty) &&
      vm.angularForm.remote_userid.$dirty &&
      vm.angularForm.remote_password.$dirty &&
      vm.angularForm.remote_verify.$dirty)) {
      return true;
    } else if((vm.currentTab == "ws") &&
      ((vm.angularForm.hostname.$dirty || vm.angularForm.validate_id.$dirty) &&
      vm.angularForm.ws_userid.$dirty &&
      vm.angularForm.ws_password.$dirty &&
      vm.angularForm.ws_verify.$dirty)) {
      return true;
    } else if((vm.currentTab == "ipmi") &&
      (vm.angularForm.ipmi_address.$dirty &&
      vm.angularForm.ipmi_userid.$dirty &&
      vm.angularForm.ipmi_password.$dirty &&
      vm.angularForm.ipmi_verify.$dirty)) {
      return true;
    } else
      return false;
  }

  function getHostFormDataComplete(response) {
    var data = response.data;

    vm.hostModel.name = data.name;
    vm.hostModel.hostname = data.hostname;
    vm.hostModel.ipmi_address = data.ipmi_address;
    vm.hostModel.custom_1 = data.custom_1;
    vm.hostModel.user_assigned_os = data.user_assigned_os;
    vm.hostModel.operating_system = data.operating_system;
    vm.hostModel.mac_address = data.mac_address;
    vm.hostModel.default_userid = data.default_userid;
    vm.hostModel.remote_userid = data.remote_userid;
    vm.hostModel.ws_userid = data.ws_userid;
    vm.hostModel.ipmi_userid = data.ipmi_userid;
    vm.hostModel.validate_id = data.validate_id;

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
