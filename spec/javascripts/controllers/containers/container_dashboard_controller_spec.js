describe('containerDashboardController gets data and', function() {
  var $scope, $controller, $httpBackend, dashboardUtilsFactory;
  var mock_data = getJSONFixture('container_dashboard_response.json');

  beforeEach(module('ManageIQ'));

  beforeEach(function() {
    var $window = {location: { pathname: '/container_dashboard/show' }};

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
    $httpBackend.when('GET','/container_dashboard/data').respond(mock_data);
    $controller = _$controller_('containerDashboardController',
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
    it('in object statuses', function() {
      for (var entity in $scope.objectStatus) {
        expect($scope.objectStatus[entity].count).toBeGreaterThan(0);
      };
    });

    it('in heatmaps and donut', function() {
      expect($scope.nodeMemoryUsage.data).toBeDefined();
      expect($scope.nodeCpuUsage.data).toBeDefined();
      expect($scope.cpuUsageData).toBeDefined();
      expect($scope.memoryUsageData).toBeDefined();
    });

    it('in network metrics', function() {
      expect($scope.networkUtilization).toBeDefined();
    });

    it('in pod metrics', function() {
      expect($scope.podEntityTrend).toBeDefined();
    });
  });
});

describe('containerDashboardController gets no data and', function() {
  var $scope, $controller, $httpBackend, dashboardUtilsFactory;
  var mock_data = getJSONFixture('container_dashboard_no_data_response.json');

  beforeEach(module('ManageIQ'));

  beforeEach(function() {
    var $window = {location: { pathname: '/container_dashboard/show' }};

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
    $httpBackend.when('GET','/container_dashboard/data').respond(mock_data);
    $controller = _$controller_('containerDashboardController',
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
    it('in object statuses', function() {
      for (var entity in $scope.objectStatus) {
        expect($scope.objectStatus[entity].count).toBeGreaterThan(0);
      };
    });

    it('in heatmaps and donut', function() {
      expect($scope.nodeMemoryUsage.dataAvailable).toBeDefined();
      expect($scope.nodeCpuUsage.dataAvailable).toBeDefined();
      expect($scope.cpuUsageData.dataAvailable).toBeDefined();
      expect($scope.memoryUsageData.dataAvailable).toBeDefined();
    });

    it('in network metrics', function() {
      expect($scope.networkUtilization.dataAvailable).toBeDefined();
    });

    it('in pod metrics', function() {
      expect($scope.podEntityTrend.dataAvailable).toBeDefined();
    });
  });
});

describe('containerDashboardController gets data for one provider and', function() {
  var $scope, $controller, $httpBackend, dashboardUtilsFactory;
  var mock_data = getJSONFixture('container_dashboard_response.json');

  beforeEach(module('ManageIQ'));

  beforeEach(function() {
    var $window = {location: { pathname: '/ems_container/42' }};

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
    $httpBackend.when('GET','/container_dashboard/data/42').respond(mock_data);
    $controller = _$controller_('containerDashboardController',
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
    it('in single provider', function() {
      expect($scope.isSingleProvider).toBe(true);
    });

    it('in heatmaps and donut', function() {
      expect($scope.nodeMemoryUsage.data).toBeDefined();
      expect($scope.nodeCpuUsage.data).toBeDefined();
      expect($scope.cpuUsageData).toBeDefined();
      expect($scope.memoryUsageData).toBeDefined();
    });

    it('in network metrics', function() {
      expect($scope.networkUtilization).toBeDefined();
    });

    it('in pod metrics', function() {
      expect($scope.podEntityTrend).toBeDefined();
    });
  });
});
