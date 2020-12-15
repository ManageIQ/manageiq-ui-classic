describe('logCollectionForm', function() {
  var $scope, $componentController, $httpBackend, miqService, vm, expectedModel;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(_$httpBackend_, $rootScope, _$componentController_, _miqService_) {

    miqService = _miqService_;
    spyOn(miqService, 'miqFlash');
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');

    $httpBackend = _$httpBackend_;

    var bindings = {
      recordId:  "123456",
      selectOptions: ["some value"],
      logCollectionFormFieldsUrl: "/ops/log_collection_form_fields/",
      saveUrl: "/ops/log_depot_edit/",
    };
    $scope = $rootScope.$new();

    vm = _$componentController_('logCollectionForm', null, bindings);

    var response = {
      depot_name: 'my_samba_depot',
      uri: 'smb://smb_location',
      uri_prefix: 'smb',
      log_userid: 'admin',
      log_protocol: 'Samba',
      log_password: 'super secret password',
    };

    expectedModel = {
      depot_name: 'my_samba_depot',
      uri: 'smb://smb_location',
      uri_prefix: 'smb',
      log_userid: 'admin',
      log_protocol: 'Samba',
      log_password: miqService.storedPasswordPlaceholder,
    };

    $httpBackend.whenGET('/ops/log_collection_form_fields/123456').respond(200, response);
    vm.$onInit();
    $httpBackend.flush();
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('#init', function() {
    it('sets the vmCloudModel correctly', function(){
      expect(vm.logCollectionModel).toEqual(expectedModel);
    });
    it('sets the modelCopy correctly', function(){
      expect(vm.modelCopy).toEqual(expectedModel);
    })
  });

  describe('#cancelClicked', function() {
    beforeEach(function(){
      vm.cancelClicked();
    });
    it('miqService.miqAjaxButton is called', function(){
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith("/ops/log_depot_edit/123456?button=cancel", true);
    });
  });

  describe('#saveClicked', function() {
    beforeEach(function(){
      vm.saveClicked();
    });

    it('miqService.miqAjaxButton is called', function(){
      var url = "/ops/log_depot_edit/123456?button=save";
      var moreUrlParams = $.param(miqService.serializeModel(vm.logCollectionModel));
      if (moreUrlParams) {
        url += '&' + decodeURIComponent(moreUrlParams);
      }
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith(url, false);
    });
  });

  describe('#resetClicked', function() {
    beforeEach(function(){
      vm.logCollectionModel = {
        depot_name: 'changed',
        uri: 'changed',
        uri_prefix: 'changed',
        log_userid: 'changed',
        log_protocol: 'changed',
        log_password: 'changed',
      };
      $scope.angularForm = {
        $setPristine: function(value) {},
      };
      vm.resetClicked($scope.angularForm);
    });

    it('model is set to original value', function(){
      expect(vm.modelCopy).toEqual(vm.logCollectionModel);
    });

    it('sets flash message to be a warning with correct message', function() {
      expect(miqService.miqFlash).toHaveBeenCalledWith("warn", "All changes have been reset");
    });
  });

  describe('miqDBBackupService should exist in the scope', function() {
    it('returns true', function() {
      expect(vm.miqDBBackupService).toBeDefined();
    });
  });

});
