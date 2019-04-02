describe('aggregateStatusCardController gets data and', function() {
  var $scope, vm, $httpBackend, API, miqService, $http;
  var provider = {
    name: 'Provider',
    type: 'provider::vm::vmware',
    vms: 2,
    ems_clusters: 1,
    hosts: 3,
    storages: 4,
    miq_templates: 2,
  };
  var aggStatus = {
    aggStatus: {
      attrData: {
        count: 6,
        href: '16?display=physical_servers',
        iconClass: 'pficon pficon-cluster',
        id: 'Servers_16',
        notification: {iconClass: 'pficon pficon-error-circle-o', count: 0},
        title: 'Servers',
      },
    },
  };

  beforeEach(module('ManageIQ'));

  beforeEach(function() {
    var $window = {location: { pathname: '/ems_infra_dashboard/show' }};

    module(function($provide) {
      $provide.value('$window', $window);
    });
  });

  beforeEach(inject(function($rootScope, _$controller_, _$httpBackend_, _API_, _miqService_, _$http_) {
    miqService = _miqService_;
    var dummyDocument = document.createElement('div');
    spyOn(document, 'getElementById').and.returnValue(dummyDocument);
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $http = _$http_;

    API = _API_;
    spyOn(API, 'get').and.callFake(function(url){
      var response = {};
      if (url === '/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::NetworkCredential&expand=resources&attributes=id,name&sort_by=name&sort_order=ascending') {
        response = {results: [{name: 'SCM credential', value: 1}]};
      } else if (url === '/api/service_dialogs/?expand=resources&attributes=id,label&sort_by=label&sort_order=ascending') {
        response = {results: [{name: 'Service Dialog', value: 2}]};
      } else if (url === '/api/service_catalogs/?expand=resources&attributes=id,name&sort_by=name&sort_order=ascending') {
        response = {results: [{name: 'Service Catalog', value: 3}]};
      } else if (url === '/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::MachineCredential&expand=resources&attributes=id,name&sort_by=name&sort_order=ascending') {
        response = {results: [{name: 'Machine credential', value: 4}]};
      } else if (url === '/api/configuration_script_sources?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ConfigurationScriptSource&expand=resources&attributes=id,name&filter[]=region_number=undefined&sort_by=name&sort_order=ascending') {
        response = {results: [{name: 'Repo', value: 5}]};
      } else if (url.startsWith('/api/providers/')) {
        response = provider;
      }
      return Promise.resolve(response);
    });
    spyOn(API, 'put').and.callFake(function(){
      var response = {success: false, message: 'Fred'};
      return Promise.resolve(response);
    });
    spyOn(API, 'post').and.callFake(function(){
      var response = {success: false, message: 'Fred'};
      return Promise.resolve(response);
    });
    spyOn($http, 'get').and.callFake(function(url) {
      var response = { data: { data: {} }};
      if (url.startsWith('/ems_physical_infra_dashboard/aggregate_status_data/')) {
        response.data.data = aggStatus;
      }
      return Promise.resolve(response);
    });
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('data loads successfully', function() {
    beforeEach(function() {
      $scope.providerId = 10000001;
      $scope.providerType = 'ems_physical_infra';
      $controller('aggregateStatusCardController as vm', {
        $scope: $scope,
        miqService: miqService,
        $http: $http,
      });
    });
    it('in object statuses', function(done) {
      setTimeout(function() {
        expect($scope.vm.AggStatus.count).toBeGreaterThan(0);
        done();
      });
    });
  });
});
