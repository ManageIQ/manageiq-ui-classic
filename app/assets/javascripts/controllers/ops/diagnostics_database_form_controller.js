ManageIQ.angular.app.controller('diagnosticsDatabaseFormController', ['$http', '$scope', '$attrs', 'miqService', 'miqDBBackupService', function($http, $scope, $attrs, miqService, miqDBBackupService) {
  var vm = this;
  var init = function() {
    ManageIQ.angular.scope = $scope;

    // NOTE: vm part of controller_name
    vm.diagnosticsDatabaseModel = {
      action_typ: 'db_backup',
      backup_schedule_type: '',
      depot_name: '',
      uri: '',
      uri_prefix: '',
      log_protocol: '',
      log_userid: '',
      log_password: '',
    };
    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.diagnosticsDatabaseModel );
    vm.dbBackupFormFieldChangedUrl = $attrs.dbBackupFormFieldChangedUrl;
    vm.submitUrl = $scope.submitUrl = $attrs.submitUrl;
    vm.validateClicked = miqService.validateWithAjax;
    vm.model = 'diagnosticsDatabaseModel';
    vm.saveable = miqService.saveable;
    ManageIQ.angular.scope = vm;
  };

  vm.backupScheduleTypeChanged = function() {
    if (vm.diagnosticsDatabaseModel.backup_schedule_type === '') {
      vm.diagnosticsDatabaseModel.depot_name = '';
      vm.diagnosticsDatabaseModel.uri = '';
      vm.diagnosticsDatabaseModel.uri_prefix = '';
      vm.diagnosticsDatabaseModel.log_userid = '';
      vm.diagnosticsDatabaseModel.log_password = '';
      vm.diagnosticsDatabaseModel.log_protocol = '';
      return;
    }

    miqService.sparkleOn();

    var url = vm.dbBackupFormFieldChangedUrl;
    $http.post(url + vm.diagnosticsDatabaseModel.backup_schedule_type)
      .then(postdiagnosticsDatabaseFormData)
      .catch(miqService.handleFailure);
  };

  vm.isBasicInfoValid = function() {
    return $scope.angularForm.depot_name.$valid &&
      $scope.angularForm.uri.$valid &&
      $scope.angularForm.log_userid.$valid &&
      $scope.angularForm.log_password.$valid;
  };

  $scope.submitButtonClicked = function(confirmMsg) {
    if (confirm(confirmMsg)) {
      miqService.sparkleOn();
      var url = $scope.submitUrl;
      miqService.miqAjaxButton(url, true);
    }
  };

  vm.canValidateBasicInfo = function() {
    return vm.isBasicInfoValid();
  };

  vm.logProtocolChanged = function() {
    vm.diagnosticsDatabaseModel.backup_schedule_type = '';
    if (vm.logProtocolSelected()) {
      $scope.$broadcast('setNewRecord');
      $scope.$broadcast('reactiveFocus');
      miqDBBackupService.logProtocolChanged(vm.diagnosticsDatabaseModel);
    }
  };

  vm.logProtocolNotSelected = function() {
    return miqDBBackupService.logProtocolNotSelected(vm.diagnosticsDatabaseModel);
  };

  vm.logProtocolSelected = function() {
    return miqDBBackupService.logProtocolSelected(vm.diagnosticsDatabaseModel);
  };

  $scope.sambaBackup = function() {
    return miqDBBackupService.sambaBackup(vm.diagnosticsDatabaseModel);
  };

  $scope.sambaRequired = function(value) {
    return miqDBBackupService.sambaRequired(vm.diagnosticsDatabaseModel, value);
  };

  function postdiagnosticsDatabaseFormData(response) {
    var data = response.data;

    $scope.$broadcast('resetClicked');
    vm.diagnosticsDatabaseModel.depot_name = data.depot_name;
    vm.diagnosticsDatabaseModel.uri = data.uri;
    vm.diagnosticsDatabaseModel.uri_prefix = data.uri_prefix;
    vm.diagnosticsDatabaseModel.log_userid = data.log_userid;

    if (vm.diagnosticsDatabaseModel.uri_prefix === 'nfs') {
      vm.diagnosticsDatabaseModel.log_protocol = 'Network File System';
    } else {
      vm.diagnosticsDatabaseModel.log_protocol = 'Samba';
    }

    vm.diagnosticsDatabaseModel.action_typ = 'db_backup';

    if (vm.diagnosticsDatabaseModel.log_userid !== '') {
      vm.diagnosticsDatabaseModel.log_password = miqService.storedPasswordPlaceholder;
    }

    $scope.$broadcast('setNewRecord', { newRecord: false });
    $scope.$broadcast('setUserId', { userIdName: 'log_userid',
      userIdValue: vm.diagnosticsDatabaseModel.log_userid });

    miqService.sparkleOff();
  }

  init();
}]);
