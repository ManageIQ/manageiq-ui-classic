describe('cloudTenantFormController', function() {
  var scope, vm, $controller, $httpBackend, miqService;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(_$httpBackend_, $rootScope, _$controller_, _miqService) {
    miqService = _miqService;

    spyOn(miqService, 'showButtons');
    spyOn(miqService, 'hideButtons');
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');
    spyOn(postService, 'cancelOperation');
    spyOn(postService, 'saveRecord');
    spyOn(postService, 'createRecord');

    scope = $rootScope.$new();

    $httpBackend = _$httpBackend_;
    $httpBackend.when('GET','/cloud_tenant/show_list').respond(mock_data);
    $controller = _$controller_('cloudTenantFormController',
      {$scope: scope});
    $httpBackend.flush();
  }));

  describe('#cancelClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function (value){}
      };
      setTimeout($scope.cancelClicked);
    });

    it('delegates to miqService.cancelOperation', function(done) {
      setTimeout(function () {
        var msg = "Edit of Cloud tenant item cloudTenantModel was cancelled by the user";
        expect(miqService.cancelOperation).toHaveBeenCalledWith(redirectUrl + "?", msg);
        done();
      });
    });
  });



});
