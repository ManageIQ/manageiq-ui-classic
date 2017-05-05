describe('adHocMetricsController', function() {
  var $scope, $controller, $httpBackend, pfViewUtils;
  var mock_data = getJSONFixture('container_live_dashboard_response.json');
  var mock_tenants_data = getJSONFixture('container_live_dashboard_tenant_response.json');
  var mock_metrics_data = getJSONFixture('container_live_dashboard_metrics_response.json');

  beforeEach(module('ManageIQ'));

  beforeEach(function() {
    var $window = {location: { pathname: '/ems_container/42' }};
    module(function($provide) {
      $provide.value('$window', $window);
    });
  });

  beforeEach(inject(function(_$httpBackend_, $rootScope, _$controller_) {
    $httpBackend = _$httpBackend_;
    $httpBackend.when('GET','/container_dashboard/data/42/?live=true&query=get_tenants').respond(mock_tenants_data);
    $httpBackend.when('GET','/container_dashboard/data/42/?live=true&tenant=_system&query=metric_tags&limit=250').respond(mock_data);
    $httpBackend.when('GET','/container_dashboard/data/42/?live=true&tenant=_system&limit=10000&query=metric_definitions&tags={}&page=1&items_per_page=8').respond(mock_metrics_data);
    $controller = _$controller_('adHocMetricsController');
    $controller.refreshList();
    $httpBackend.flush();
  }));

  afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
  });

  describe('loading page data', function() {
    it('should load tag list', function() {
      expect($controller.filterConfig.fields.length).toBe(12);
    });

    it('should load metrics definitions', function() {
      expect($controller.loadingMetrics).toBeDefined();
      expect($controller.loadingMetrics).toBe(false);
      expect($controller.items.length).toBe(2);
    });
  });

  describe('count increment', function() {
    it('should increment the count', function() {
      $controller.countIncrement();
      expect($controller.timeFilter.range_count).toBe(2);
    });

    it('should decrement the count', function() {
      $controller.timeFilter.range_count = 10;
      $controller.countDecrement();
      expect($controller.timeFilter.range_count).toBe(9);
    });
  });
});
