/**
 * Created by swi2 on 31/03/2017.
 */
describe('floatingIpFormController', function() {
  var $http,$scope, $controller, floatingIpFormId,miqService,vm;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function($rootScope,$http, _$controller_, miqService, ) {
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'miqFlash');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');
    $scope = $rootScope.$new();
    $scope.vm = {};
    $scope.vm.floatingIpModel = {
      name:                         'floatingIpName',
      description:                  'floatingIpDescription'
    };

    $controller = _$controller_('floatingIpFormController', {
      $scope: $scope,
      floatingIpFormId: 1000000000001
    });

  }));

  describe('#saveClicked', function() {
    beforeEach(function() {
      setTimeout($scope.saveClicked);
    });

    it('delegates to saveRecord', function(done) {
      setTimeout(function() {
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith(
          '/floating_ip/update/1000000000001?button=save',
          $scope.vm.floatingIpModel,
          { complete: false }
        );
        done();
      });
    });
  });

  describe('#resetClicked', function() {
    beforeEach(function() {
      $scope.vm.floatingIpModel.name = 'floatingIpName';
      $scope.angularForm = {
        $setPristine: function (value){},
        $setUntouched: function (value){},
      };
      setTimeout($scope.resetClicked);
    });

    it('warn, All changes have been reset', function(done) {
      setTimeout(function() {
        expect($scope.vm.floatingIpModel.name).toEqual('floatingIpName');
        done();
      });
    });
  });




});
