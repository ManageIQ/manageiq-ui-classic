describe('cloud-volume-backup-form', function() {
  var $componentController, vm, miqService, API, $httpBackend, $scope;

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

    var bindings = {recordId: 1111};
    vm = $componentController('cloudVolumeBackupForm', null, bindings);
    var volumeChoicesResponse = {volume_choices: [{ name : "original value" }, { name: "changed value" }]};
    $httpBackend.whenGET('/cloud_volume_backup/volume_form_choices').respond(volumeChoicesResponse);
    vm.$onInit();
    $httpBackend.flush();
  }));

  describe('#init', function() {
    var expectedValue = {
      volume: { name: "original value" },
      name: ''
    };

    it('sets model correctly', function() {
      expect(vm.cloudVolumeBackupModel).toEqual(expectedValue);
    });

    it('sets the modelCopy to equal model', function() {
      expect(vm.modelCopy).toEqual(expectedValue);
    })
  });

  describe('#cancelClick', function() {
    beforeEach(function(){
      vm.cancelClicked();
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });

    it('delegates miqService ajaxButton', function() {
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/cloud_volume_backup/backup_restore/1111?button=cancel');
    });
  });

  describe('#saveClick', function() {
    beforeEach(function(){
      vm.saveClicked();
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });

    it('delegates miqService ajaxButton', function() {
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/cloud_volume_backup/backup_restore/1111?button=restore', vm.cloudVolumeBackupModel, { complete: false });
    });
  });

  describe('#resetClick', function() {
    beforeEach(function(){
      vm.cloudVolumeBackupModel.volume = { name: "changed value" };
      $scope.angularForm = {
        $setPristine: function(value) {},
      };
      vm.resetClicked($scope.angularForm);
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });

    it('sets vm.cloudVolumeBackupModel to vm.modelCopy', function() {
      expect(vm.cloudVolumeBackupModel.volume).toEqual({ name: "original value" });
    });

    it('sets flash message to be a warning with correct message', function() {
      expect(miqService.miqFlash).toHaveBeenCalledWith("warn", "All changes have been reset");
    });
  });
});
