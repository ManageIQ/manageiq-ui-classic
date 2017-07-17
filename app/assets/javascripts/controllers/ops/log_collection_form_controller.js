ManageIQ.angular.app.controller('logCollectionFormController', ['$http', '$scope', 'serverId', '$attrs', 'miqService', 'miqDBBackupService', function($http, $scope, serverId, $attrs, miqService, miqDBBackupService) {

  var vm = this;

  var init = function() {
    console.log('collection log');
    $scope.logCollectionModel = vm.logCollectionModel = {
      depot_name: '',
      uri: '',
      uri_prefix: '',
      log_protocol: '',
      log_userid: '',
      log_password: '',
    };


    vm.afterGet = true;
    vm.modelCopy = angular.copy( $scope.logCollectionModel );
    vm.logCollectionFormFieldsUrl = $attrs.logCollectionFormFieldsUrl;
    vm.logProtocolChangedUrl = $attrs.logProtocolChangedUrl;
    vm.saveUrl = $attrs.saveUrl;
    vm.validateClicked = miqService.validateWithAjax;
    vm.model = 'logCollectionModel';
    // TODO: check in template
    $scope.miqDBBackupService = vm.miqDBBackupService = miqDBBackupService;

    ManageIQ.angular.scope = $scope;

    if (serverId == 'new') {
      vm.logCollectionModel.depot_name = '';
      vm.logCollectionModel.uri = '';
      vm.logCollectionModel.uri_prefix = '';
      vm.logCollectionModel.log_userid = '';
      vm.logCollectionModel.log_password = '';
      vm.logCollectionModel.log_protocol = '';
      vm.modelCopy = angular.copy( $scope.logCollectionModel );

    } else {
      $scope.newRecord = vm.newRecord = false;

      miqService.sparkleOn();

      var url = vm.logCollectionFormFieldsUrl;
      $http.get(url + serverId)
        .then(getLogCollectionFormData)
        .catch(miqService.handleFailure);
    }

    console.log('show test: ', vm.miqDBBackupService.credsProtocol(vm.logCollectionModel), ', protocol: ',  vm.logCollectionModel.log_protocol);
  };

  vm.logProtocolChanged = function() {
    miqService.sparkleOn();
    if(miqDBBackupService.knownProtocolsList.indexOf($scope.logCollectionModel.log_protocol) == -1 &&
       $scope.logCollectionModel.log_protocol != '') {
      var url = $scope.logProtocolChangedUrl;
      $http.get(url + serverId + '?log_protocol=' + $scope.logCollectionModel.log_protocol)
        .then(getLogProtocolData)
        .catch(miqService.handleFailure);
    }
    $scope.$broadcast('reactiveFocus');
    miqDBBackupService.logProtocolChanged($scope.logCollectionModel);
    miqService.sparkleOff();
  };

  $scope.isBasicInfoValid = function() {
    if($scope.angularForm.depot_name.$valid &&
      $scope.angularForm.uri.$valid &&
      $scope.angularForm.log_userid.$valid &&
      $scope.angularForm.log_password.$valid)
      return true;
    else
      return false;
  };

  $scope.saveClicked = function() {
    miqService.sparkleOn();
    var url = vm.saveUrl + serverId + '?button=save';
    var moreUrlParams = $.param(miqService.serializeModel($scope.logCollectionModel));
    if (moreUrlParams) {
      url += '&' + decodeURIComponent(moreUrlParams);
    }
    miqService.miqAjaxButton(url, false);
    $scope.angularForm.$setPristine(true);
  };

  $scope.resetClicked = function() {
    $scope.$broadcast('resetClicked');
    vm.logCollectionModel = angular.copy( $scope.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  $scope.cancelClicked = function() {
    miqService.sparkleOn();
    var url = vm.saveUrl + serverId + '?button=cancel';
    miqService.miqAjaxButton(url, true);
    $scope.angularForm.$setPristine(true);
  };

  $scope.canValidateBasicInfo = vm.canValidateBasicInfo = function() {
    return $scope.isBasicInfoValid();
  }

  function getLogCollectionFormData(response) {
    var data = response.data;

    $scope.logCollectionModel.log_protocol = data.log_protocol;
    $scope.logCollectionModel.depot_name = data.depot_name;
    $scope.logCollectionModel.uri = data.uri;
    $scope.logCollectionModel.uri_prefix = data.uri_prefix;
    $scope.logCollectionModel.log_userid = data.log_userid;

    vm.logCollectionModel.log_protocol = data.log_protocol;
    vm.logCollectionModel.depot_name = data.depot_name;
    vm.logCollectionModel.uri = data.uri;
    vm.logCollectionModel.uri_prefix = data.uri_prefix;
    vm.logCollectionModel.log_userid = data.log_userid;

    if ($scope.logCollectionModel.log_userid !== '') {
      $scope.logCollectionModel.log_password = miqService.storedPasswordPlaceholder;
    }

    if (vm.logCollectionModel.log_userid !== '') {
      vm.logCollectionModel.log_password = miqService.storedPasswordPlaceholder;
    }

    vm.afterGet = true;
    $scope.modelCopy = vm.modelCopy = angular.copy( $scope.logCollectionModel );

    miqService.sparkleOff();
  }

  function getLogProtocolData(response) {
    var data = response.data;

    $scope.logCollectionModel.depot_name = data.depot_name;
    $scope.logCollectionModel.uri = data.uri;
    $scope.logCollectionModel.uri_prefix = data.uri_prefix;
    miqService.sparkleOff();
  }

  init();
}]);
