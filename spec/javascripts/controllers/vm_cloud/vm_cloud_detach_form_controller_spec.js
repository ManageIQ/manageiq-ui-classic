describe('vmCloudDetachFormController', function() {
  var $http, $scope, $controller, vmCloudAssociateFloatingIpFormId, miqService, vm;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function($rootScope, $http, _$controller_, _miqService_) {
    miqService = _miqService_;

    spyOn(miqService, 'miqAjaxButton');

    $scope = $rootScope.$new();
    $scope.vm = {};
    $scope.vm.vmCloudModel = {
      name: '',
    };

    vm = _$controller_('vmCloudDetachFormController as vm', {
      $scope: $scope,
      miqService: miqService,
      vmCloudDetachFormId: 1000000000001,
    });
  }));

  describe('#submitClicked', function() {
    beforeEach(function() {
      setTimeout(vm.submitClicked);
    });

    it('delegates to miqService.miqAjaxButton', function(done) {
      setTimeout(function() {
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith(
          '/vm_cloud/detach_volume/1000000000001?button=detach',
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
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/vm_cloud/detach_volume/1000000000001?button=cancel');
        done();
      });
    });
  });

  describe('#resetClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function(value) {},
      };
      setTimeout(vm.resetClicked);
    });

    it('sets modelCopy to vmCloudModel', function(done) {
      setTimeout(function() {
        expect(vm.vmCloudModel).toEqual(vm.modelCopy);
        done();
      });
    });
  });
});
