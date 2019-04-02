describe('networkTopologyController', function() {
    var scope, $controller, $httpBackend;
    var mock_data =  getJSONFixture('network_topology_response.json');
    var cloud_subnet = { id:"396086e5-7b0d-11e5-8286-18037327aaeb",  item:{display_kind:"CloudSubnet", name:"EmsRefreshSpec-SubnetPrivate_3000", kind:"CloudSubnet", id:"396086e5-7b0d-11e5-8286-18037327aaeb", miq_id:"100012"}};
    var network_provider = { id:"4",  item:{display_kind:"Openstack", name:"myProvider", kind:"NetworkManager", id:"2", miq_id:"2"}};

    beforeEach(module('ManageIQ'));

    beforeEach(inject(function(_$httpBackend_, $rootScope, _$controller_, $location) {
      spyOn($location, 'absUrl').and.returnValue('/network_topology/show');
      scope = $rootScope.$new();

      $httpBackend = _$httpBackend_;
      $httpBackend.when('GET','/network_topology/data').respond(mock_data);
      $controller = _$controller_('networkTopologyController',
          {$scope: scope});
      $httpBackend.flush();
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('data loads successfully', function() {
      it('in all main objects', function() {
        expect($controller.items).toBeDefined();
        expect($controller.relations).toBeDefined();
        expect($controller.kinds).toBeDefined();
      });
    });

    describe('kinds contain all expected kinds', function() {
      it('in all main objects', function() {
        expect(Object.keys($controller.kinds).length).toBeGreaterThan(7);
        expect($controller.kinds["CloudSubnet"]).toBeDefined();
        expect($controller.kinds["NetworkRouter"]).toBeDefined();
        expect($controller.kinds["FloatingIp"]).toBeDefined();
        expect($controller.kinds["Vm"]).toBeDefined();
        expect($controller.kinds["SecurityGroup"]).toBeDefined();
        expect($controller.kinds["CloudTenant"]).toBeDefined();
      });
    });

    describe('the topology gets correct icons', function() {
      it('in graph elements', function() {
        var d = { id:"2",  item:{display_kind:"Amazon", kind:"NetworkManager", id:"2"}};
        expect($controller.getIcon(d)).toMatch(/amazon/);
        expect($controller.getIcon(network_provider)).toMatch(/openstack/);
        d = { id:"3",  item:{display_kind:"SecurityGroup", kind:"SecurityGroup", id:"3"}};
        expect($controller.getIcon(d)).toEqual("\uE903");
        d = { id:"4",  item:{display_kind:"VM", kind:"Vm", id:"4"}};
        expect($controller.getIcon(d)).toEqual("\uE90f");
        expect($controller.getIcon(cloud_subnet)).toEqual("\uE909");
      });
    });

    describe('dimensions are returned correctly', function() {
      it('of all objects', function() {
        var d = { id:"2",  item:{display_kind:"Openstack", kind:"NetworkManager", id:"2", miq_id:"37"}};
        expect($controller.getDimensions(d)).toEqual({ x: -20, y: -20, r: 28 });
        expect($controller.getDimensions(network_provider)).toEqual({ x: -20, y: -20, r: 28 });
        d = { id:"3",  item:{display_kind:"SecurityGroup", kind:"SecurityGroup", id:"3", miq_id:"30"}};
        expect($controller.getDimensions(d)).toEqual({ x: 0, y: 9, r: 17 });
        d = { id:"4",  item:{display_kind:"VM", kind:"Vm", id:"4", miq_id:"25"}};
        expect($controller.getDimensions(d)).toEqual({ x: 0, y: 9, r: 21 });
        expect($controller.getDimensions(cloud_subnet)).toEqual({ x: 0, y: 9, r: 19 });
      });
    });

});
