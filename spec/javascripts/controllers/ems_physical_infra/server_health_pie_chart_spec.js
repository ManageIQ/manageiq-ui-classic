describe('serverHealthPieChartController', function() {
  var  miqService, $httpBackend, $http, chartsMixin;
  var serversGroup = {
    serversGroup: {
      availableServers: {
        columns: {used: 0, available: 4},
        xData: ["dates", "2018-07-03"],
        yData: ["Server", 4],
      },
      serversHealth: {
        columns: {valid: 4, warning: 0, critical: 0},
        xData: ["dates", "2018-07-03"],
        yData: ["Server", 4],
      },
    }
  };

  beforeEach(module('ManageIQ'));

  beforeEach(function() {
    var $window = {location: { pathname: '/ems_physical_infra/show' }};

    module(function($provide) {
      $provide.value('$window', $window);
    });
  });

  beforeEach(inject(function(_$controller_, _miqService_, _chartsMixin_, _$httpBackend_, _$http_) {
    miqService = _miqService_;
    var dummyDocument = document.createElement('div');
    spyOn(document, 'getElementById').and.returnValue(dummyDocument);
    $controller = _$controller_;
    chartsMixin = _chartsMixin_;
    $http = _$http_;
    $httpBackend = _$httpBackend_;

    spyOn($http, 'get').and.callFake(function(url) {
      var response = { data: { data: {} }};
      if (url.startsWith('/ems_physical_infra_dashboard/servers_group_data/')) {
        response.data.data = serversGroup;
      }
      return Promise.resolve(response);
    });
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('gets data', function() {
    it('and it loads successfully', function(done) {
      Promise.resolve(
        $controller('serverHealthPieChartController', {
          miqService: miqService,
          chartsMixin: chartsMixin,
          $http: $http
        }))
        .then(function (serverHealthController) {
          expect(serverHealthController.metricsData.serversGroup).toBeTruthy();
          expect(serverHealthController.data).toBeTruthy();
          done();
        });
    });
  });
});
