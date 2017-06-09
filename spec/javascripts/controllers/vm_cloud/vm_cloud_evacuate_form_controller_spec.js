describe('vmCloudEvacuateFormController', function() {
  var $http, $scope, $controller, vmCloudEvacuateFormId, miqService, vm;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function($rootScope, $http, _$controller_, _miqService_) {
    miqService = _miqService_;

    spyOn(miqService, 'miqAjaxButton');

    $scope = $rootScope.$new();
    $scope.vm = {};
    $scope.vm.vmCloudModel = {
      auto_select_host:    true,
      destination_host:    null,
      on_shared_storage:   true,
      admin_password:      null
    };

    vm = _$controller_('vmCloudEvacuateFormController as vm', {
      $scope: $scope,
      miqService: miqService,
      vmCloudEvacuateFormId: 1000000000001,
    });
  }));

  describe('#submitClicked', function() {
    beforeEach(function() {
      setTimeout(vm.submitClicked);
    });

    it('delegates to miqService.miqAjaxButton', function(done) {
      setTimeout(function() {
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith(
          '/vm_cloud/evacuate_vm/1000000000001?button=submit',
          true
        );
        done();
      });
    });
  });

  describe('#cancelClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function(value) {},
      };
      setTimeout(vm.cancelClicked);
    });

    it('delegates to miqService.miqAjaxButton', function(done) {
      setTimeout(function() {
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/vm_cloud/evacuate_vm/1000000000001?button=cancel');
        done();
      });
    });
  });
});
