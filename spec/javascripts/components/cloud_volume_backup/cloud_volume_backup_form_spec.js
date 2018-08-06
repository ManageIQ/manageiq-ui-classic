describe('cloud-volume-backup-form', function() {
  var $componentController, vm, miqService, API;

  beforeEach(module('ManageIQ'));
  beforeEach(inject(function (_$componentController_, _$httpBackend_, _miqService_, $rootScope) {
    $componentController = _$componentController_;
    $httpBackend = _$httpBackend_;
    miqService = _miqService_;
    $scope = $rootScope.$new();

    spyOn(miqService, 'miqFlash');
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');

    var bindings = {cloudVolumeBackupFormId: 1111};
    vm = $componentController('cloudVolumeBackupFormComponent', null, bindings);
    var volumeChoicesResponse = {volume_choices: ["pepa","pepik"]};
    $httpBackend.whenGET('/cloud_volume_backup/volume_form_choices').respond(volumeChoicesResponse);
    vm.$onInit();
    $httpBackend.flush();
  }));

  describe('#init', function() {
    it('sets the retirementDate to the value returned with http request', function(){
      expect(vm.cloudVolumeBackupModel.volume).toEqual("pepa");
    });

    it('sets the modelCopy', function(){
      var expectedModel = {
        volume: "pepa",
        volume_id: '',
      };
      expect(vm.modelCopy).toEqual(expectedModel);
    })
  });

  describe('#cancelClick', function(){
    beforeEach(function(){
      vm.cancelClicked();
    });
    it('turns the spinner on via the miqService', function(){
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });
    it('turns the spinner twice via the miqService', function(){
      expect(miqService.sparkleOn.calls.count()).toBe(2);
    });
    it('delegates miqService ajaxButton', function(){
      var cancelUrl = '/cloud_volume_backup/backup_restore/';
      var buttonUrl = '?button=cancel';
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith(cancelUrl + vm.cloudVolumeBackupFormId + buttonUrl);
    });
  });

  describe('#saveClick', function(){
    beforeEach(function(){
      vm.saveClicked();
    });
    it('turns the spinner on via the miqService', function(){
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });
    it('turns the spinner twice via the miqService', function(){
      expect(miqService.sparkleOn.calls.count()).toBe(2);
    });
    it('delegates miqService ajaxButton', function(){
      var restoreUrl = '/cloud_volume_backup/backup_restore/';
      var buttonUrl = '?button=restore';
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith(restoreUrl + vm.cloudVolumeBackupFormId + buttonUrl, vm.cloudVolumeBackupModel, { complete: false });
    });
  });

  describe('#resetClick', function(){
    beforeEach(function(){
      vm.cloudVolumeBackupModel.volume_id = 42;
      $scope.angularForm = {
        $setPristine: function(value) {}
      };
      vm.resetClicked($scope.angularForm);
    });
    it('turns the spinner on via the miqService', function(){
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });
    it('turns the spinner twice via the miqService', function(){
      expect(miqService.sparkleOn.calls.count()).toBe(2);
    });
    it('sets vm.cloudVolumeBackupModel to vm.modelCopy', function(){
      expect(vm.modelCopy).toEqual(vm.cloudVolumeBackupModel);
    });
    it('sets flash message to be a warning with correct message', function(){
      expect(miqService.miqFlash).toHaveBeenCalledWith("warn", "All changes have been reset");
    });
  });
});
