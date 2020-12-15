describe('diagnosticsDatabaseFormController', function() {
  var $scope, $controller, $httpBackend, miqService, vm, uriPrefixes;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(_$httpBackend_, $rootScope, _$controller_, _miqService_) {

  miqService = _miqService_;
  uriPrefixes = {FileDepotSmb: "smb", FileDepotNfs: "nfs", FileDepotS3: "s3", FileDepotSwift: "swift"};
  spyOn(miqService, 'miqFlash');
  spyOn(miqService, 'miqAjaxButton');
  spyOn(miqService, 'sparkleOn');
  spyOn(miqService, 'sparkleOff');
  $scope = $rootScope.$new();
  $scope.diagnosticsDatabaseModel = { depot_name:   '',
                                      uri:          '',
                                      uri_prefix:   '',
                                      log_userid:   '',
                                      log_password: '',
                                    };

  $httpBackend = _$httpBackend_;

  $controller = vm = _$controller_('diagnosticsDatabaseFormController',
                              {$scope: $scope,
                               $attrs: {'dbBackupFormFieldChangedUrl': '/ops/db_backup_form_field_changed/'},
                               miqService: miqService,
                               uriPrefixes: uriPrefixes
                              });
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('when the diagnostics database form loads', function() {
    it('sets the depot_name to blank', function () {
      expect(vm.diagnosticsDatabaseModel.depot_name).toEqual('');
    });

    it('sets the uri to blank', function () {
      expect(vm.diagnosticsDatabaseModel.uri).toEqual('');
    });

    it('sets the uri_prefix to blank', function () {
      expect(vm.diagnosticsDatabaseModel.uri_prefix).toEqual('');
    });

    it('sets the log_userid to blank', function () {
      expect(vm.diagnosticsDatabaseModel.log_userid).toEqual('');
    });

    it('sets the log_password to blank', function () {
      expect(vm.diagnosticsDatabaseModel.log_password).toEqual('');
    });
  });

  describe('when user selects a nfs backup db schedule from dropdown', function() {
    var diagnosticsDBFormResponse = {
      depot_name:   'my_nfs_depot',
      uri:          'nfs://nfs_location',
      uri_prefix:   'nfs',
      log_userid:   '',
      log_password: '',
    };

    beforeEach(inject(function() {
      $httpBackend.whenPOST('/ops/db_backup_form_field_changed/12345').respond(200, diagnosticsDBFormResponse);
      vm.diagnosticsDatabaseModel.backup_schedule_type = '12345';
      vm.backupScheduleTypeChanged();
      $httpBackend.flush();
    }));

    it('sets the depot_name to the value returned from the http request', function () {
      expect(vm.diagnosticsDatabaseModel.depot_name).toEqual('my_nfs_depot');
    });

    it('sets the uri to the value returned from the http request', function () {
      expect(vm.diagnosticsDatabaseModel.uri).toEqual('nfs://nfs_location');
    });

    it('sets the uri_prefix to the value returned from the http request', function () {
      expect(vm.diagnosticsDatabaseModel.uri_prefix).toEqual('nfs');
    });

    it('sets the log_userid to the value returned from the http request', function () {
      expect(vm.diagnosticsDatabaseModel.log_userid).toEqual('');
    });

    it('sets the log_password to the value returned from the http request', function () {
      expect(vm.diagnosticsDatabaseModel.log_password).toEqual('');
    });
  });

  describe('when user selects a samba backup db schedule from dropdown', function() {
    var diagnosticsDBFormResponse = {
      depot_name:   'my_samba_depot',
      uri:          'smb://smb_location',
      uri_prefix:   'smb',
      log_userid:   'admin'
    };

    beforeEach(inject(function() {
      $httpBackend.whenPOST('/ops/db_backup_form_field_changed/123456').respond(200, diagnosticsDBFormResponse);
      vm.diagnosticsDatabaseModel.log_protocol = 'Samba';
      vm.diagnosticsDatabaseModel.backup_schedule_type = '123456';
      vm.backupScheduleTypeChanged();
      $httpBackend.flush();
    }));

    it('sets the depot_name to the value returned from the http request', function () {
      expect(vm.diagnosticsDatabaseModel.depot_name).toEqual('my_samba_depot');
    });

    it('sets the uri to the value returned from the http request', function () {
      expect(vm.diagnosticsDatabaseModel.uri).toEqual('smb://smb_location');
    });

    it('sets the uri_prefix to the value returned from the http request', function () {
      expect(vm.diagnosticsDatabaseModel.uri_prefix).toEqual('smb');
    });

    it('sets the log_userid to the value returned from the http request', function () {
      expect(vm.diagnosticsDatabaseModel.log_userid).toEqual('admin');
    });

    it('sets the log_password to the value returned from the http request', function () {
      expect(vm.diagnosticsDatabaseModel.log_password).toEqual(miqService.storedPasswordPlaceholder);
    });
  });
});
