describe('vmCloudEvacuateForm', function() {
  var $scope, $componentController, miqService, $httpBackend, vm;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function($rootScope, _$componentController_, _miqService_, _$httpBackend_) {
    miqService = _miqService_;
    $httpBackend = _$httpBackend_;

    spyOn(miqService, 'miqAjaxButton');

    $scope = $rootScope.$new();
    $scope.vm = {};

    var bindings = {
      recordId: "42",
      message: "1 Instance to be Evacuated",
    };
    vm = _$componentController_('vmCloudEvacuateForm', null, bindings);

    var response = { clusters: ["some cluster"], hosts: ["some host"] };
    $httpBackend.whenGET('/vm_cloud/evacuate_form_fields/42').respond(response);

    vm.$onInit();
    $httpBackend.flush();
  }));

  describe('#init', function() {
    var expectedModel = {
      auto_select_host:    true,
      destination_host:    null,
      on_shared_storage:   true,
      admin_password:      null,
    };
    it('sets the vmCloudModel correctly', function(){
      expect(vm.vmCloudModel).toEqual(expectedModel);
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
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith("/vm_cloud/evacuate_vm/42?button=cancel");
    });
  });

  describe('#submitClicked', function() {
    beforeEach(function(){
      vm.submitClicked();
    });
    it('miqService.miqAjaxButton is called', function(){
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/vm_cloud/evacuate_vm/42?button=submit', vm.vmCloudModel );
    });
  });
});
