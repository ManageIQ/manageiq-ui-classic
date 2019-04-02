
describe('containerProjectDashboardController gets data for one project and', function() {
  var $scope, $controller, $httpBackend, dashboardUtilsFactory;
  var mock_data = getJSONFixture('container_project_dashboard_response.json');

  beforeEach(module('ManageIQ'));

  beforeEach(function() {
    var $window = {location: { pathname: '/container_project/show/42' }};

    module(function($provide) {
      $provide.value('$window', $window);
    });
  });

  beforeEach(inject(function(_$httpBackend_, $rootScope, _$controller_, _dashboardUtilsFactory_) {
    var dummyDocument = document.createElement('div');
    spyOn(document, 'getElementById').and.returnValue(dummyDocument);
    $scope = $rootScope.$new();
    dashboardUtilsFactory = _dashboardUtilsFactory_;

    $httpBackend = _$httpBackend_;
    $httpBackend.when('GET','/container_dashboard/project_data/42').respond(mock_data);
    $controller = _$controller_('containerProjectDashboardController',
      {$scope: $scope,
       dashboardUtilsFactory: dashboardUtilsFactory
      });
    $httpBackend.flush();
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('data loads successfully', function() {
    it('in utilization charts', function() {
      expect($scope.cpuUsageData).toBeDefined();
      expect($scope.memoryUsageData).toBeDefined();
      expect($scope.networkUtilization).toBeDefined();
    });

    it('and loadingDone is true', function() {
      expect($scope.loadingDone).toBe(true);
    });
  });
});
