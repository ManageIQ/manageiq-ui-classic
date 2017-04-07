describe('cloudNetworkFormController', function () {
  var $scope, vm, $controller, $httpBackend, miqService;
  beforeEach(module('ManageIQ'));

  beforeEach(inject(function ($rootScope, _$controller_, _$httpBackend_, _miqService_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    miqService = _miqService_;
    vm = _$controller_('CloudNetworkFormController as vm',
      {$http: $httpBackend,
       $scope: $scope,
       cloudNetworkFormId: "new",
       miqService: _miqService_
      }
    )

  }));


});
