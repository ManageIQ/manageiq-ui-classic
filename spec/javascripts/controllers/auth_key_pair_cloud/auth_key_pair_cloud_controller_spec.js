describe('keyPairCloudFormController', function() {
  var $scope, vm, $httpBackend, miqService;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(_$httpBackend_, $rootScope, _$controller_, _miqService_) {
    miqService = _miqService_;
    spyOn(miqService, 'showButtons');
    spyOn(miqService, 'hideButtons');
    spyOn(miqService, 'buildCalendar');
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');
    $scope = $rootScope.$new();
    spyOn($scope, '$broadcast');

    //$scope.hostForm.$invalid = false;
    $httpBackend = _$httpBackend_;
    var providerResponse = {"ems_choices":
      [{"name": "OS1", "id":5}
    ]};

    $httpBackend.whenGET('/auth_key_pair_cloud/ems_form_choices').respond(providerResponse);
    vm = _$controller_('keyPairCloudFormController as vm', {
      $scope: $scope,
      keyPairFormId: 'new',
      miqService: miqService
    });
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('initialization', function() {
    beforeEach(function() {
      $httpBackend.flush();

      $scope.angularForm = {
        $setPristine: function(value) {}
      };
    });

    describe('when the keyPairFormId is new', function() {
      it('sets the name to blank', function () {
        expect(vm.keyPairModel.name).toEqual('');
      });

      it('sets the hostname to blank', function () {
        expect(vm.keyPairModel.public_key).toEqual('');
      });
    });
  });

  describe('#saveClicked', function() {
    beforeEach(function() {
      $httpBackend.flush();

      $scope.angularForm = {
        $setPristine: function(value) {},
      };

      vm.saveClicked();
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });

    it('turns the spinner on twice', function() {
      expect(miqService.sparkleOn.calls.count()).toBe(2);
    });

    it('delegates to miqService.miqAjaxButton', function() {
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/auth_key_pair_cloud/create/new?button=save', miqService.serializeModel(vm.keyPairModel), { complete: false });
    });
  });

  describe('#cancelClicked', function() {
    beforeEach(function() {
      $httpBackend.flush();

      $scope.angularForm = {
        $setPristine: function(value) {},
      };

      vm.cancelClicked();
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });

    it('delegates to miqService.restAjaxButton', function() {
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/auth_key_pair_cloud/create/new?button=cancel');
    });
  });
});
