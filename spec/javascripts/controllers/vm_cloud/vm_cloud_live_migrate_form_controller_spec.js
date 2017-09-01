describe('vmCloudLiveMigrateFormController', function() {
  var $http, $scope, $controller, vmCloudAssociateFloatingIpFormId, miqService, vm;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function($rootScope, $http, _$controller_, _miqService_) {
    miqService = _miqService_;

    spyOn(miqService, 'miqAjaxButton');

    $scope = $rootScope.$new();
    $scope.vm = {};
    $scope.vm.vmCloudModel = {
      auto_select_host:    true,
      cluster_id:          null,
      destination_host_id: null,
      block_migration:     false,
      disk_over_commit:    false
    };

    vm = _$controller_('vmCloudLiveMigrateFormController as vm', {
      $scope: $scope,
      miqService: miqService,
      vmCloudLiveMigrateFormId: 1000000000001,
    });
  }));

  describe('#submitClicked', function() {
    beforeEach(function() {
      setTimeout($scope.submitClicked);
    });

    it('delegates to miqService.miqAjaxButton', function(done) {
      setTimeout(function() {
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith(
          '/vm_cloud/live_migrate_vm/1000000000001?button=submit',
          $scope.vm.vmCloudModel
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
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/vm_cloud/live_migrate_vm/1000000000001?button=cancel');
        done();
      });
    });
  });
});
