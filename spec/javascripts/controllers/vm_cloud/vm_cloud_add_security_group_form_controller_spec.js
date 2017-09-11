describe('vmCloudAddSecurityGroupFormController', function() {
  var $http, $controller, vmCloudAddSecurityGroupFormId, miqService, vm;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function($rootScope, $http, _$controller_, _miqService_) {
    miqService = _miqService_;

    spyOn(miqService, 'miqAjaxButton');

    $scope = $rootScope.$new();

    vm = _$controller_('vmCloudAddSecurityGroupFormController as vm', {
      $scope: $scope,
      miqService: miqService,
      vmCloudAddSecurityGroupFormId: 1000000000001,
    });
    vm.vmCloudModel = {
      security_group: 'test',
    };
  }));

  describe('#saveClicked', function() {
    beforeEach(function() {
      setTimeout(vm.saveClicked);
    });

    it('delegates to miqService.miqAjaxButton', function(done) {
      setTimeout(function() {
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith(
          '/vm_cloud/add_security_group_vm/1000000000001?button=submit',
          vm.vmCloudModel,
          { complete: false }
        );
        done();
      });
    });
  });

  describe('#cancelClicked', function() {
    beforeEach(function() {
      angularForm = {
        $setPristine: function(value) {},
      };
      setTimeout(vm.cancelClicked);
    });

    it('delegates to miqService.miqAjaxButton', function(done) {
      setTimeout(function() {
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/vm_cloud/add_security_group_vm/1000000000001?button=cancel');
        done();
      });
    });
  });
});
