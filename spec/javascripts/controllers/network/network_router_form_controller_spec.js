describe('networkRouterController', function() {
  var $http, $scope, $controller, networkRouterFormId, miqService, vm;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function($rootScope, $http, _$controller_, _miqService_) {
    miqService = _miqService_;
    spyOn(miqService, 'miqAjaxButton');
    $scope = $rootScope.$new();
    $scope.vm = {};

    $scope.vm.networkRouterModel = {
      name: '',
      cloud_subnet_id: '',
    };

    vm = _$controller_('networkRouterFormController as vm', {
      $scope: $scope,
      miqService: miqService,
      networkRouterFormId: 1000000000001,
    });
  }));


  describe('#cancelClicked', function() {
    beforeEach(function() {
      setTimeout(vm.cancelClicked);
    });

    it('delegates to miqService.miqAjaxButton', function(done) {
      setTimeout(function() {
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith(
          '/network_router/update/1000000000001?button=cancel'
        );
        done();
      });
    });
  });

  describe('#addInterfaceClicked', function() {
    beforeEach(function() {
      setTimeout(vm.addInterfaceClicked);
    });

    it('delegates to miqService.miqAjaxButton', function(done) {
      setTimeout(function() {
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith(
          '/network_router/add_interface/1000000000001?button=add',
          $scope.vm.networkRouterModel,
          { complete: false }
        );
        done();
      });
    });
  });

  describe('#removeInterfaceClicked', function() {
    beforeEach(function() {
      setTimeout(vm.removeInterfaceClicked);
    });

    it('delegates to miqService.miqAjaxButton', function(done) {
      setTimeout(function() {
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith(
          '/network_router/remove_interface/1000000000001?button=remove',
          $scope.vm.networkRouterModel,
          { complete: false }
        );
        done();
      });
    });
  });
});
