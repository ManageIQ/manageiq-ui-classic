ManageIQ.angular.app.controller('logCollectionFormController', ['$http', '$scope', 'serverId', '$attrs', 'miqService', 'miqDBBackupService', function($http, $scope, serverId, $attrs, miqService, miqDBBackupService) {
  var vm = this;
  var init = function() {
    vm.logCollectionModel = {
      depot_name: '',
      uri: '',
      uri_prefix: '',
      log_protocol: '',
      log_userid: '',
      log_password: '',
    };
    vm.saveable = miqService.saveable;
    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.logCollectionModel );
    vm.logCollectionFormFieldsUrl = $attrs.logCollectionFormFieldsUrl;
    vm.logProtocolChangedUrl = $attrs.logProtocolChangedUrl;
    vm.saveUrl = $attrs.saveUrl;
    vm.prefix = 'log';
    vm.model = 'logCollectionModel';
    vm.miqDBBackupService = miqDBBackupService;
    ManageIQ.angular.scope = vm;

    if (serverId == 'new') {
      vm.logCollectionModel.depot_name = '';
      vm.logCollectionModel.uri = '';
      vm.logCollectionModel.uri_prefix = '';
      vm.logCollectionModel.log_userid = '';
      vm.logCollectionModel.log_password = '';
      vm.logCollectionModel.log_protocol = '';
      vm.modelCopy = angular.copy( vm.logCollectionModel );
    } else {
      vm.newRecord = false;

      miqService.sparkleOn();

      var url = vm.logCollectionFormFieldsUrl;
      $http.get(url + serverId)
        .then(getLogCollectionFormData)
        .catch(miqService.handleFailure);
    }
  };

  vm.validateClicked = function() {
    miqService.validateWithAjax(vm.saveUrl + '?button=validate&type=' + vm.prefix);
  }

  vm.logProtocolChanged = function() {
    miqService.sparkleOn();
    if(miqDBBackupService.knownProtocolsList.indexOf(vm.logCollectionModel.log_protocol) == -1 &&
       vm.logCollectionModel.log_protocol != '') {
      var url = vm.logProtocolChangedUrl;
      $http.get(url + serverId + '?log_protocol=' + vm.logCollectionModel.log_protocol)
        .then(getLogProtocolData)
        .catch(miqService.handleFailure);
    }
    $scope.$broadcast('reactiveFocus');
    miqDBBackupService.logProtocolChanged(vm.logCollectionModel);
    miqService.sparkleOff();
  };

  vm.isBasicInfoValid = function() {
    return $scope.angularForm.depot_name.$valid &&
      $scope.angularForm.uri.$valid
  };

  vm.saveClicked = function() {
    miqService.sparkleOn();
    var url = vm.saveUrl + serverId + '?button=save';
    var moreUrlParams = $.param(miqService.serializeModel(vm.logCollectionModel));
    if (moreUrlParams) {
      url += '&' + decodeURIComponent(moreUrlParams);
    }
    miqService.miqAjaxButton(url, false);
  };

  vm.resetClicked = function() {
    $scope.$broadcast('resetClicked');
    vm.logCollectionModel = angular.copy( vm.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    var url = vm.saveUrl + serverId + '?button=cancel';
    miqService.miqAjaxButton(url, true);
  };

  vm.canValidateBasicInfo = function () {
    return vm.isBasicInfoValid();
  }

  function getLogCollectionFormData(response) {
    var data = response.data;

    vm.logCollectionModel.log_protocol = data.log_protocol;
    vm.logCollectionModel.depot_name = data.depot_name;
    vm.logCollectionModel.uri = data.uri;
    vm.logCollectionModel.uri_prefix = data.uri_prefix;
    vm.logCollectionModel.log_userid = data.log_userid;

    if (vm.logCollectionModel.log_userid !== '') {
      vm.logCollectionModel.log_password = miqService.storedPasswordPlaceholder;
    }

    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.logCollectionModel );

    miqService.sparkleOff();
  }

  function getLogProtocolData(response) {
    var data = response.data;

    vm.logCollectionModel.depot_name = data.depot_name;
    vm.logCollectionModel.uri = data.uri;
    vm.logCollectionModel.uri_prefix = data.uri_prefix;
    miqService.sparkleOff();
  }

  init();
}]);
