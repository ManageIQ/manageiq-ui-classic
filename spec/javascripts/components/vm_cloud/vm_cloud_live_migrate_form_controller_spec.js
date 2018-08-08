describe('vmCloudLiveMigrateForm', function() {
  var $scope, $componentController, miqService, $httpBackend, vm;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function($rootScope, _$componentController_, _miqService_, _$httpBackend_) {
    miqService = _miqService_;
    $httpBackend = _$httpBackend_;

    spyOn(miqService, 'miqAjaxButton');

    $scope = $rootScope.$new();

    var bindings = { recordId: 1000000000001, message: "1 Instance to be Live Migrated" };
    vm = _$componentController_('vmCloudLiveMigrateForm', null, bindings);
    var response = { clusters: ["some cluster"], hosts: ["some host"] };
    $httpBackend.whenGET('/vm_cloud/live_migrate_form_fields/1000000000001').respond(response);
    vm.$onInit();
    $httpBackend.flush();
  }));

  describe('#init', function() {
    var expectedModel = { auto_select_host: true, cluster_id: null, destination_host_id: null, block_migration: false, disk_over_commit: false };

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
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/vm_cloud/live_migrate_vm/1000000000001?button=cancel');
    });
  });

  describe('#submitClicked', function() {
    beforeEach(function(){
      vm.submitClicked();
    });

    it('miqService.miqAjaxButton is called', function(){
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/vm_cloud/live_migrate_vm/1000000000001?button=submit', vm.vmCloudModel);
    });
  });
});
