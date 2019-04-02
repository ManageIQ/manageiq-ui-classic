describe('floatingIpFormController', function() {
  var $http, $scope, $controller, floatingIpFormId, miqService, vm;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function($rootScope, $http, _$controller_, _miqService_) {
    miqService = _miqService_;

    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'miqFlash');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');

    $scope = $rootScope.$new();

    vm = _$controller_('floatingIpFormController as vm', {
      $scope: $scope,
      miqService: miqService,
      floatingIpFormId: 1000000000001,
    });
  }));

  describe('#saveClicked', function() {
    beforeEach(function() {
      setTimeout(vm.saveClicked);
    });

    it('delegates to saveRecord', function(done) {
      setTimeout(function() {
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith(
          '/floating_ip/update/1000000000001?button=save',
          jasmine.objectContaining({ address: $scope.vm.floatingIpModel.address }),
          { complete: false }
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

    it('delegates to cancelOperation', function(done) {
      setTimeout(function() {
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/floating_ip/update/1000000000001?button=cancel');
        done();
      });
    });
  });
});
