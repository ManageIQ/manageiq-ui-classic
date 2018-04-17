ManageIQ.angular.app.component('diagnosticsDatabaseFormComponent', {
  controller: diagnosticsDatabaseFormController,
  controllerAs: 'vm',
  templateUrl: '/static/diagnostics-database-tab.html.haml',
  bindings: {
    'diagnosticsDatabaseId': '@',
  },
});

diagnosticsDatabaseFormController.$inject = ['$http', '$scope', 'miqService', 'miqDBBackupService', 'submitUrl', 'dbBackupFormFieldChanged', 'sb', 'databaseDisplayName', 'databaseDetails', 'backupSchedules', 'databaseBackupOptionsForSelect'];

function diagnosticsDatabaseFormController($http, $scope, miqService, miqDBBackupService, submitUrl, dbBackupFormFieldChanged, sb, databaseDisplayName, databaseDetails, backupSchedules, databaseBackupOptionsForSelect){
  var vm = this;
  var init = function() {
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
    vm.dbBackupFormFieldChangedUrl = dbBackupFormFieldChanged;
    vm.submitUrl = submitUrl;
    vm.model = 'diagnosticsDatabaseModel';
    vm.saveable = miqService.saveable;
    vm.prefix = 'log';
    vm.validateUrl = '/ops/log_depot_validate?button=validate&type=' + vm.prefix;
    ManageIQ.angular.scope = vm;
    vm.sb = sb;
    vm.databaseDisplayName = databaseDisplayName;
    vm.databaseDetails = databaseDetails;
    vm.backupSchedules = backupSchedules;
    vm.databaseBackupOptionsForSelect = databaseBackupOptionsForSelect;
  };

  vm.validateClicked = function() {
    miqService.validateWithAjax(vm.validateUrl);
  }

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
      $scope.angularForm.uri.$valid;
  };

  vm.submitButtonClicked = function(confirmMsg) {
    if (confirm(confirmMsg)) {
      miqService.sparkleOn();
      var url = vm.submitUrl;
      miqService.miqAjaxButton(url, vm.diagnosticsDatabaseModel);
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

  vm.sambaBackup = function() {
    return miqDBBackupService.sambaBackup(vm.diagnosticsDatabaseModel);
  };

  vm.sambaRequired = function(value) {
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

  vm.$onInit = init;
}


