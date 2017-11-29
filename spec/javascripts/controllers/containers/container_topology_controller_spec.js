describe('containerTopologyController', function() {
    var scope;
    var $controller;
    var $httpBackend;
    var ctrl;
    var mock_data =  getJSONFixture('container_topology_response.json');
    var replicator = {
        id: "396086e5-7b0d-11e5-8286-18037327aaeb",
        item: {
            display_kind: "Replicator",
            name: "replicator1",
            kind: "ContainerReplicator",
            id: "396086e5-7b0d-11e5-8286-18037327aaeb",
            miq_id: "10",
        }
    };
    var openshift = {
        id: "2",
        item: {
            display_kind: "Openshift",
            kind: "ContainerManager",
            id: "2",
            miq_id: "37",
        },
    };
    var vm = {
        id: "4",
        item: {
            display_kind: "VM",
            kind: "Vm",
            id: "4",
            miq_id: "25"
        },
    };
    var pod = {
        id: "3",
        item: {
            display_kind: "Pod",
            kind: "ContainerGroup",
            id: "3",
        }
    };

    beforeEach(module('ManageIQ'));
    beforeEach(inject(function(_$httpBackend_, $rootScope, _$controller_, $location) {
      spyOn($location, 'absUrl').and.returnValue('/container_topology/show/1?display=topology');
      scope = $rootScope.$new();
      $httpBackend = _$httpBackend_;
      $httpBackend.when('GET','/container_project_topology/data/1').respond(mock_data);
      ctrl = _$controller_('containerTopologyController',
        {
          $scope: scope,
        }
      );
      $httpBackend.flush();
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('data loads successfully', function() {
      it('in all main objects', function() {
        expect(ctrl.items).toBeDefined();
        expect(ctrl.relations).toBeDefined();
        expect(ctrl.kinds).toBeDefined();
      });
    });

    describe('kinds contain all expected kinds', function() {
      it('in all main objects', function() {
        expect(Object.keys(ctrl.kinds).length).toBeGreaterThan(7);
        expect(ctrl.kinds["Container"]).toBeDefined();
        expect(ctrl.kinds["Pod"]).toBeDefined();
        expect(ctrl.kinds["Node"]).toBeDefined();
        expect(ctrl.kinds["Route"]).toBeDefined();
      });
    });

    describe('the topology gets correct icons', function() {
      it('in graph elements', function() {
        expect(ctrl.getIcon(openshift).icon).toMatch(/openshift/);
        expect(ctrl.getIcon(openshift).type).toEqual("image");
        expect(ctrl.getIcon(pod).icon).toEqual("\uF1B3");
        expect(ctrl.getIcon(pod).type).toEqual("glyph");
        expect(ctrl.getIcon(vm).icon).toEqual("\uE90f");
        expect(ctrl.getIcon(replicator).icon).toEqual("\uE624");
      });
    });

    describe('dimensions are returned correctly', function() {
      it('of all objects', function() {
        expect(ctrl.getDimensions(openshift)).toEqual({ x: -20, y: -20, r: 28 });
        expect(ctrl.getDimensions(pod)).toEqual({ x: 1, y: 6, r: 17 });
        expect(ctrl.getDimensions(vm)).toEqual({ x: 0, y: 9, r: 21 });
        expect(ctrl.getDimensions(replicator)).toEqual({ x: -1, y: 8, r: 17 });
      });
    });
});
