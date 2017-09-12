describe('vmCloudAssociateFloatingIpFormController', function() {
  var $http, $scope, $controller, vmCloudAssociateFloatingIpFormId, miqService, vm;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function($rootScope, $http, _$controller_, _miqService_) {
    miqService = _miqService_;

    spyOn(miqService, 'miqAjaxButton');

    $scope = $rootScope.$new();
    $scope.vm = {};
    $scope.vm.vmCloudModel = {
      floating_ip: 42,
    };

    vm = _$controller_('vmCloudAssociateFloatingIpFormController as vm', {
      $scope: $scope,
      miqService: miqService,
      vmCloudAssociateFloatingIpFormId: 1000000000001,
    });
  }));

  describe('#submitClicked', function() {
    beforeEach(function() {
      setTimeout($scope.submitClicked);
    });

    it('delegates to miqService.miqAjaxButton', function(done) {
      setTimeout(function() {
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith(
          '/vm_cloud/associate_floating_ip_vm/1000000000001?button=submit',
          $scope.vm.vmCloudModel,
          {complete: false}
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
      setTimeout($scope.cancelClicked);
    });

    it('delegates to miqService.miqAjaxButton', function(done) {
      setTimeout(function() {
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/vm_cloud/associate_floating_ip_vm/1000000000001?button=cancel', {complete: false});
        done();
      });
    });
  });
});
