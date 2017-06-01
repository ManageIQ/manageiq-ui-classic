describe('evmRelationshipFormController', function() {
  var $scope, $controller, controllerName, postService;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function($rootScope, $location, _$controller_, miqService, _postService_, $q) {
    postService = _postService_;
    spyOn(miqService, 'showButtons');
    spyOn(miqService, 'hideButtons');
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');
    spyOn(postService, 'cancelOperation');
    spyOn(postService, 'saveRecord');
    $scope = $rootScope.$new();
    $scope.vm = {};
    $scope.vm.evmRelationshipModel = {
      miq_server: 1
    };

    vm = _$controller_('evmRelationshipFormController', {
      $scope: $scope,
      service: postService,
      controllerName: 'vm_infra',
      evmRelationshipFormId: 1000000000001
    });
  }));

  var redirectUrl = '/vm_infra/explorer';

  describe('initialization', function() {
    it('sets the miq_server to the value returned via the http request', function(done) {
      setTimeout(function () {
        expect($scope.vm.evmRelationshipModel.miq_server).toEqual(1);
        done();
      });
    });
  });

  describe('#cancelClicked', function() {
    beforeEach(function() {
      vm.angularForm = {
        $setPristine: function (value){}
      };
      setTimeout(vm.cancelClicked);
    });

    it('delegates to postService.cancelOperation', function(done) {
      setTimeout(function () {
        var msg = "Edit of ManageIQ Server Relationship cancelled by user.";
        expect(postService.cancelOperation).toHaveBeenCalledWith(redirectUrl, msg);
        done();
      });
    });
  });

  describe('#resetClicked', function() {
    beforeEach(function() {
      vm.modelCopy = {'miq_server': 10};
      // change value in form
      vm.evmRelationshipModel.miq_server = 1;
      vm.angularForm = {
        $setPristine: function (value){},
        $setUntouched: function (value){},
      };
      setTimeout(vm.resetClicked);
    });

    it('resets value of name field to initial value', function(done) {
      setTimeout(function() {
        // value should be reset to value in modeCopy
        expect(vm.evmRelationshipModel.miq_server).toEqual(10);
        done();
      });
    });
  });

  describe('#saveClicked', function() {
    beforeEach(function() {
      setTimeout(vm.saveClicked);
    });

    it('delegates to postService.saveRecord', function(done) {
      setTimeout(function() {
        expect(postService.saveRecord).toHaveBeenCalledWith(
          '/api/vms/1000000000001',
          redirectUrl,
          {'miq_server' : {'id': vm.evmRelationshipModel.miq_server}},
          sprintf(__("Management Engine Relationship saved")),
          'set_miq_server'
        );
        done();
      });
    });
  });
});
