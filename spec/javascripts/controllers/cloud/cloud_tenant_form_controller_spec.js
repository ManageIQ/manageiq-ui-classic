describe('cloudTenantFormController', function() {
  var $scope, vm, miqService;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function($rootScope, _$controller_, _miqService_) {
    miqService = _miqService_;

    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'miqFlash');

    $scope = $rootScope.$new();

    vm = _$controller_('cloudTenantFormController as vm', {
      $scope: $scope,
      miqService: miqService,
      cloudTenantFormId: 'new',
    });
  }));

  describe('#cancelClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function(value) {},
      };
      
      setTimeout(vm.cancelClicked);
    });

    it('delegates to miqService.miqAjaxButton', function(done) {
      setTimeout(function() {
        var redirectUrl = '/cloud_tenant/create/new?button=cancel';
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith(redirectUrl);
        done();
      });
    });
  });

  describe('#addClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function(value) {},
      };
      
      setTimeout(vm.addClicked);
    });

    it('delegates to miqService.miqAjaxButton', function(done) {
      setTimeout(function() {
        var redirectUrl = '/cloud_tenant/create/new?button=add';
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith(redirectUrl, vm.cloudTenantModel, { complete: false });
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

    it('warns the user with flash', function(done) {
      setTimeout(function() {
        expect(miqService.miqFlash).toHaveBeenCalled();
        done();
      });
    });
  });
});
