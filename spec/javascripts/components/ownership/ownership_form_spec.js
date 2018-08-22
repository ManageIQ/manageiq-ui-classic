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
    $scope.ownershipModel = {
      owner: '',
      group: '',
    };
    $httpBackend = _$httpBackend_;

    var bindings = {
      recordIds: [1000000000001,1000000000003],
      optionsUser: 'testUser',
      optionsGroup: 'testGroup'
    };
    vm = _$componentController_('ownershipForm', null, bindings);
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
      owner: '',
      group: '',
    };
    it('sets the vmCloudModel correctly', function(){
      expect(vm.ownershipModel).toEqual(expectedModel);
    });
    it('sets the modelCopy correctly', function(){
      expect(vm.modelCopy).toEqual(expectedModel);
    })
  });
});
