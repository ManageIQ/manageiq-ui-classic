describe('vmCloudResizeFormController', function() {
  var $http, $scope, $controller, vmCloudAssociateFloatingIpFormId, miqService, vm;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function($rootScope, $http, _$controller_, _miqService_) {
    miqService = _miqService_;

    spyOn(miqService, 'miqAjaxButton');

    $scope = $rootScope.$new();
    $scope.vm = {};
    $scope.vm.vmCloudModel = {
      flavor_id: null,
    };

    vm = _$controller_('vmCloudResizeFormController as vm', {
      $scope: $scope,
      miqService: miqService,
      vmCloudResizeFormId: 1000000000001,
      objectId: 1000000000001,
    });
  }));

  describe('#submitClicked', function() {
    beforeEach(function() {
      setTimeout($scope.submitClicked);
    });

    it('delegates to miqService.miqAjaxButton', function(done) {
      setTimeout(function() {
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith(
          '/vm_cloud/resize_vm/1000000000001?button=submit',
          {objectId: vm.objectId,
           flavor_id: vm.vmCloudModel.flavor_id}
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
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/vm_cloud/resize_vm/1000000000001?button=cancel', {objectId: vm.objectId});
        done();
      });
    });
  });
});
