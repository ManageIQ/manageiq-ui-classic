describe('ownershipForm', function() {
  var $scope, $componentController, $httpBackend, miqService, vm;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function($rootScope, _$componentController_, _$httpBackend_, _miqService_) {
    miqService = _miqService_;
    spyOn(miqService, 'miqFlash');
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    $componentController = _$componentController_;

    var bindings = {
      recordIds: [1000000000001,1000000000003],
      optionsUser: [["No User User", '']],
      optionsGroup: [["No User Group", '']]
    };
    vm = $componentController('ownershipForm', null, bindings);
    var response = {user: null, group: null};
    $httpBackend.whenPOST('ownership_form_fields', {object_ids: bindings.recordIds}).respond(response);

    vm.$onInit();
    $httpBackend.flush();
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('#init', function() {
    var expectedModel = {
      user: '',
      group: '',
    };

    it('sets the vmCloudModel correctly', function(){
      expect(vm.ownershipModel).toEqual(expectedModel);
    });

    it('sets the modelCopy correctly', function(){
      expect(vm.modelCopy).toEqual(expectedModel);
    });
  });

  describe('#cancelClicked', function() {
    beforeEach(function(){
      vm.cancelClicked();
    });
    it('miqService.miqAjaxButton is called', function(){
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith("ownership_update/?button=cancel");
    });
  });

  describe('#resetClicked', function() {
    beforeEach(function(){
      vm.ownershipModel = {
        user: 'changed value',
        group: 'changed value',
      };

      $scope.angularForm = {
        $setPristine: function(value) {},
      };

      vm.resetClicked($scope.angularForm);
    });

    it('model is reset to original value', function(){
      expect(vm.modelCopy).toEqual(vm.ownershipModel);
    });

    it('sets flash message to be a warning with correct message', function() {
      expect(miqService.miqFlash).toHaveBeenCalledWith("warn", "All changes have been reset");
    });
  });

  describe('#saveClicked', function() {
    beforeEach(function(){
      vm.ownershipModel = {
        user: 'changed value',
        group: 'changed value',
      };
      vm.saveClicked();
    });
    it('miqService.miqAjaxButton is called', function(){
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith("ownership_update/?button=save",{ objectIds: vm.recordIds, user: 'changed value', group: 'changed value' });
    });
  });
});
