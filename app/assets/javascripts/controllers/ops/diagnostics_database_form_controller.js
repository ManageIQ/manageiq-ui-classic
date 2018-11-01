ManageIQ.angular.app.controller('diagnosticsDatabaseFormController', ['$http', '$scope', '$attrs', 'miqService', 'miqDBBackupService', function($http, $scope, $attrs, miqService, miqDBBackupService) {
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
      log_aws_region: '',
      openstack_region: '',
      keystone_api_version: '',
      v3_domain_ident: '',
      swift_api_port: 5000,
      security_protocol: '',
    };
    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.diagnosticsDatabaseModel );
    vm.dbBackupFormFieldChangedUrl = $attrs.dbBackupFormFieldChangedUrl;
    vm.submitUrl = $attrs.submitUrl;
    vm.model = 'diagnosticsDatabaseModel';
    vm.saveable = miqService.saveable;
    vm.prefix = 'log';
    vm.validateUrl = '/ops/log_depot_validate?button=validate&type=' + vm.prefix;
    ManageIQ.angular.scope = vm;
  };

  vm.validateClicked = function() {
    miqService.validateWithAjax(vm.validateUrl);
  };

  vm.backupScheduleTypeChanged = function() {
    if (vm.diagnosticsDatabaseModel.backup_schedule_type === '') {
      vm.diagnosticsDatabaseModel.depot_name = '';
      vm.diagnosticsDatabaseModel.uri = '';
      vm.diagnosticsDatabaseModel.uri_prefix = '';
      vm.diagnosticsDatabaseModel.log_userid = '';
      vm.diagnosticsDatabaseModel.log_password = '';
      vm.diagnosticsDatabaseModel.log_protocol = '';
      vm.diagnosticsDatabaseModel.log_aws_region = '';
      vm.diagnosticsDatabaseModel.openstack_region = '';
      vm.diagnosticsDatabaseModel.keystone_api_version = '';
      vm.diagnosticsDatabaseModel.v3_domain_ident = '';
      vm.diagnosticsDatabaseModel.swift_api_port = 5000;
      vm.diagnosticsDatabaseModel.security_protocol = '';
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

  vm.sambaBackup = function() {
    return miqDBBackupService.sambaBackup(vm.diagnosticsDatabaseModel);
  };

  vm.sambaRequired = function(value) {
    return miqDBBackupService.sambaRequired(vm.diagnosticsDatabaseModel, value);
  };

  vm.regionSelect = function() {
    return vm.diagnosticsDatabaseModel.log_protocol === 'AWS S3';
  };

  vm.regionRequired = function() {
    return (vm.diagnosticsDatabaseModel.log_protocol === 'AWS S3' &&
      (vm.diagnosticsDatabaseModel.log_aws_region === '' || typeof vm.diagnosticsDatabaseModel.log_aws_region === 'undefined'));
  };

  vm.swiftSecurityProtocolSelect = function() {
    return vm.diagnosticsDatabaseModel.action_typ === 'db_backup' && vm.diagnosticsDatabaseModel.log_protocol === 'OpenStack Swift';
  };

  vm.swiftSecurityProtocolRequired = function() {
    return (miqDBBackupService.swiftBackup(vm.diagnosticsDatabaseModel) &&
      ! vm.diagnosticsDatabaseModel.security_protocol);
  };

  vm.credsProtocol = function() {
    return miqDBBackupService.credsProtocol(vm.diagnosticsDatabaseModel);
  };

  vm.credsRequired = function(value) {
    return miqDBBackupService.credsRequired(vm.diagnosticsDatabaseModel, value);
  };

  vm.awsRegionRequired = function(value) {
    return miqDBBackupService.awsRegionRequired(vm.diagnosticsDatabaseModel, value);
  };

  function postdiagnosticsDatabaseFormData(response) {
    var data = response.data;

    $scope.$broadcast('resetClicked');
    vm.diagnosticsDatabaseModel.depot_name = data.depot_name;
    vm.diagnosticsDatabaseModel.uri = data.uri;
    vm.diagnosticsDatabaseModel.uri_prefix = data.uri_prefix;
    vm.diagnosticsDatabaseModel.log_userid = data.log_userid;

    vm.diagnosticsDatabaseModel.log_protocol = diagnosticsLogProtocol(vm.diagnosticsDatabaseModel.uri_prefix);
    if (vm.diagnosticsDatabaseModel.uri_prefix === 's3') {
      vm.diagnosticsDatabaseModel.log_aws_region = data.log_aws_region;
    } else if (vm.diagnosticsDatabaseModel.uri_prefix === 'swift') {
      vm.diagnosticsDatabaseModel.openstack_region     = data.openstack_region;
      vm.diagnosticsDatabaseModel.keystone_api_version = data.keystone_api_version;
      vm.diagnosticsDatabaseModel.v3_domain_ident      = data.v3_domain_ident;
      vm.diagnosticsDatabaseModel.security_protocol    = data.security_protocol;
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

  function diagnosticsLogProtocol(prefix) {
    return {
      nfs: 'Network File System',
      smb: 'Samba',
      s3: 'AWS S3',
      swift: 'OpenStack Swift',
    }[prefix] || '';
  }

  init();
}]);
