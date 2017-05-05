describe('cloudNetworkFormController', function () {
  var $scope, vm, $httpBackend, miqService;
  beforeEach(module('ManageIQ'));

  beforeEach(inject(function ($rootScope, _$controller_, _$httpBackend_, _miqService_) {
    $scope = $rootScope.$new();
    miqService = _miqService_;
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');
    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET('/ops/cloud_network_form_fields/new').respond();
    vm = _$controller_('CloudNetworkFormController as vm',
      {$http: $httpBackend,
        $scope: $scope,
        cloudNetworkFormId: "new",
        miqService: _miqService_
      }
    )

  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('#saveClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function (value){}
      };
      $scope.saveClicked();
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });

    it('turns the spinner on once', function() {
      expect(miqService.sparkleOn.calls.count()).toBe(true);
    });

    it('delegates to miqService.miqAjaxButton', function() {
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/cloud_network/cloud_network_form_fields/' + vm.cloudNetworkFormId + '?button=save', true);
    });
  });

  describe('#cancelClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function (value){}
      };
      $scope.cancelClicked();
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });

    it('turns the spinner on once', function() {
      expect(miqService.sparkleOn.calls.count()).toBe(true);
    });

    it('delegates to miqService.miqAjaxButton', function() {
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/cloud_network/update/' + vm.cloudNetworkFormId + '?button=cancel');
    });
  });

  describe('#addClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function (value){}
      };
      $scope.cancelClicked();
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });

    it('turns the spinner on once', function() {
      expect(miqService.sparkleOn.calls.count()).toBe(true);
    });

    it('delegates to miqService.miqAjaxButton', function() {
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('create/new' + '?button=add');
    });
  });


});
