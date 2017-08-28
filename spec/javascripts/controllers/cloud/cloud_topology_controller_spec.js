describe('cloudTopologyController', function() {
  var scope;
  var $httpBackend;
  var vm;
  var mockData =  getJSONFixture('cloud_topology_response.json');
  var cloudTenant = {
    id: '396086e5-7b0d-11e5-8286-18037327aaeb',
    item: {
      display_kind: 'CloudTenant',
      name: 'admin',
      kind: 'CloudTenant',
      id: '396086e5-7b0d-11e5-8286-18037327aaeb',
      miq_id: '100012',
    },
  };
  var cloudProvider = {
    id: '4',
    item: {
      display_kind: 'Openstack',
      name: 'myProvider',
      kind: 'CloudManager',
      id: '2',
      miq_id: '2',
    },
  };
  beforeEach(module('ManageIQ'));
  beforeEach(inject(function(_$httpBackend_, $rootScope, _$controller_, $location) {
    spyOn($location, 'absUrl').and.returnValue('/network_topology/show');
    scope = $rootScope.$new();

    $httpBackend = _$httpBackend_;
    $httpBackend.when('GET', '/cloud_topology/data').respond(mockData);
    vm = _$controller_('cloudTopologyController',
          {$scope: scope});
    $httpBackend.flush();
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('data loads successfully', function() {
    it('in all main objects', function() {
      expect(vm.items).toBeDefined();
      expect(vm.relations).toBeDefined();
      expect(vm.kinds).toBeDefined();
    });
  });

  describe('kinds contain all expected kinds', function() {
    it('in all main objects', function() {
      expect(Object.keys(scope.kinds).length).toBeGreaterThan(4);
      expect(scope.kinds.AvailabilityZone).toBeDefined();
      expect(scope.kinds.Vm).toBeDefined();
      expect(scope.kinds.CloudTenant).toBeDefined();
    });
  });

  describe('the topology gets correct icons', function() {
    it('in graph elements', function() {
      var d = {
        id: '2',
        item: {
          display_kind: 'Openstack',
          kind: 'CloudManager',
          id: '2',
        },
      };
      expect(vm.getIcon(d)).toMatch(/openstack/);
      expect(vm.getIcon(cloudProvider)).toMatch(/openstack/);
      d = {
        id: '4',
        item: {
          display_kind: 'VM',
          kind: 'Vm',
          id: '4',
        },
      };
      expect(vm.getIcon(d)).toEqual('\uE90f');
      expect(vm.getIcon(cloudTenant)).toEqual('\uE904');
    });
  });

  describe('dimensions are returned correctly', function() {
    it('of all objects', function() {
      var d = {
        id: '2',
        item: {
          display_kind: 'Openstack',
          kind: 'CloudManager',
          id: '2',
          miq_id: '37',
        },
      };
      expect(vm.getDimensions(d)).toEqual({ x: -20, y: -20, r: 28 });
      expect(vm.getDimensions(cloudProvider)).toEqual({ x: -20, y: -20, r: 28 });
      d = {
        id: '4',
        item: {
          display_kind: 'VM',
          kind: 'Vm',
          id: '4',
          miq_id: '25',
        },
      };
      expect(vm.getDimensions(d)).toEqual({ x: 0, y: 9, r: 21 });
      expect(vm.getDimensions(cloudTenant)).toEqual({ x: 0, y: 9, r: 19 });
    });
  });
});
