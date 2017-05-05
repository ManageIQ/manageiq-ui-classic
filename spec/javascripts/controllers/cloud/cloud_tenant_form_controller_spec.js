describe('cloudTenantFormController', function() {
  var scope, vm, $controller, $httpBackend, miqService;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(_$httpBackend_, $rootScope, _$controller_, _miqService_) {
    miqService = _miqService_;

    spyOn(miqService, 'showButtons');
    spyOn(miqService, 'hideButtons');
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'miqFlash');

    scope = $rootScope.$new();

    var mock_data = { name: 'test', ems_id: 1 };

    $httpBackend = _$httpBackend_;
    $httpBackend.when('GET','/cloud_tenant/show_list').respond(mock_data);
    $controller = _$controller_('cloudTenantFormController as vm',{
      $scope: scope,
      miqService: miqService,
      cloudTenantFormId: 'new'});
  }));

  describe('#cancelClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function (value){}
      };
      setTimeout($controller.cancelClicked);
    });

    it('delegates to miqService.miqAjaxButton', function(done) {
      setTimeout(function () {
        var redirectUrl = '/cloud_tenant/create/new' + '?button=cancel';
        expect(miqService.miqAjaxButton).toHaveBeenCalledWith(redirectUrl);
        done();
      });
    });
  });

  describe('#saveClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
          $setPristine: function (value){}
      };
      setTimeout($controller.saveClicked);
    });

    it('delegates to miqService.miqAjaxButton', function(done) {
      setTimeout(function () {
          var redirectUrl = 'create/new' + '?button=add';
          expect(miqService.miqAjaxButton).toHaveBeenCalledWith(redirectUrl, $controller.cloudTenantModel, { complete: false });
          done();
      });
    });
  });


  describe('#resetClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
          $setPristine: function (value){}
      };
      setTimeout($controller.resetClicked);
    });

    it('warns the user with flash', function(done) {
      setTimeout(function () {
          expect(miqService.miqFlash).toHaveBeenCalled();
          done();
      });
    });
  });
});
