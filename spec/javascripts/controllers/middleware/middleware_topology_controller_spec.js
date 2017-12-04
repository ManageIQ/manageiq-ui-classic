describe('middlewareTopologyController', function () {
  var scope;
  var $controller;
  var $httpBackend;
  var topologyService;
  var ctrl;
  var mock_data = getJSONFixture('middleware_topology_response.json');

  var mw_manager = {
    id: "MiddlewareManager1", item: {
      "name": "localhost",
      "kind": "MiddlewareManager",
      "miq_id": 1,
      "status": "Unknown",
      "display_kind": "Hawkular",
      "icon": "vendor-hawkular"
    }
  };

  var mw_server = {
    id: "MiddlewareServer1", item: {
      "name": "Local",
      "kind": "MiddlewareServer",
      "miq_id": 1,
      "status": "Running",
      "display_kind": "MiddlewareServer",
      "icon": "vendor-wildfly"
    }
  };

  var mw_server_wildfly = {
    id: "MiddlewareServerWildfly1", item: {
      "name": "Local DMR",
      "kind": "MiddlewareServerWildfly",
      "miq_id": 1,
      "status": "Running",
      "display_kind": "MiddlewareServerWildfly",
      "icon": "vendor-wildfly"
    }
  };

  var mw_server_eap = {
    id: "MiddlewareServerEap1", item: {
      "name": "Local DMR",
      "kind": "MiddlewareServerEap",
      "miq_id": 1,
      "status": "Running",
      "display_kind": "MiddlewareServerEap",
      "icon": "vendor-jboss-eap"
    }
  };

  var mw_server_starting = {
    id: "MiddlewareServer1", item: {
      "status": "Starting"
    }
  };

  var mw_server_reload = {
    id: "MiddlewareServer1", item: {
      "status": "Reload required"
    }
  };

  var mw_server_down = {
    id: "MiddlewareServer1", item: {
      "status": "Down"
    }
  };

  var mw_server_unknown = {
    id: "MiddlewareServer1", item: {
      "status": "Unknown"
    }
  };

  var mw_deployment = {
    id: "MiddlewareDeployment1",
    item: {
      "name": "hawkular-command-gateway-war.war",
      "kind": "MiddlewareDeployment",
      "miq_id": 1,
      "status": "Enabled",
      "display_kind": "MiddlewareDeploymentWar"
    }
  };

  var mw_deployment_disabled = {
    id: "MiddlewareDeployment1",
    item: {
      "status": "Disabled",
    }
  };

  var mw_deployment_unknown = {
    id: "MiddlewareDeployment1",
    item: {
      "status": "Unknown",
    }
  };

  var mw_datasource = {
    id: "MiddlewareDatasource1",
    item: {
      "name": "Datasource [ExampleDS]",
      "kind": "MiddlewareDatasource",
      "miq_id": 1,
      "status": "Unknown",
      "display_kind": "MiddlewareDatasource"
    }
  };

  var vm = {
    id: "Vm1",
    item: {
      "name": "Vm",
      "kind": "Vm",
      "miq_id": 1,
      "status": "Unknown",
      "display_kind": "Vm"
    }
  };

  var mw_domain = {
    id: "MiddlewareDomain1",
    item: {
      "name": "master",
      "kind": "MiddlewareDomain",
      "miq_id": 1,
      "status": "Unknown",
      "display_kind": "MiddlewareDomain"
    }
  };

  var mw_server_group = {
    id: "MiddlewareServerGroup1",
    item: {
      "name": "main-server-group",
      "kind": "MiddlewareServerGroup",
      "miq_id": 1,
      "status": "Unknown",
      "display_kind": "MiddlewareServerGroup"
    }
  };

  var mw_messaging = {
    id: "MiddlewareMessaging1",
    item: {
      "name": "JMS Topic [HawkularMetricData]",
      "kind": "MiddlewareMessaging",
      "miq_id": 1,
      "status": "Unknown",
      "display_kind": "MiddlewareMessaging"
    }
  };

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function (_$httpBackend_, $rootScope, _$controller_, $location, _topologyService_) {
    spyOn($location, 'absUrl').and.returnValue('/middleware_topology/show');
    scope = $rootScope.$new();
    topologyService = _topologyService_;

    $httpBackend = _$httpBackend_;
    $httpBackend.when('GET', '/middleware_topology/data').respond(mock_data);
    ctrl = _$controller_('middlewareTopologyController',
      {$scope: scope, topologyService: _topologyService_});
    $httpBackend.flush();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('mw topology data loads successfully', function () {
    it('in all main objects', function () {
      expect(ctrl.items).toBeDefined();
      expect(ctrl.relations).toBeDefined();
      expect(ctrl.kinds).toBeDefined();
    });
  });


  describe('kinds contains all expected mw kinds', function () {
    it('in all main objects', function () {
      expect(Object.keys(scope.kinds).length).toBe(10);
      expect(ctrl.kinds["MiddlewareManager"]).toBeDefined();
      expect(ctrl.kinds["MiddlewareServer"]).toBeDefined();
      expect(ctrl.kinds["MiddlewareServerEap"]).toBeDefined();
      expect(ctrl.kinds["MiddlewareServerWildfly"]).toBeDefined();
      expect(ctrl.kinds["MiddlewareDeployment"]).toBeDefined();
      expect(ctrl.kinds["MiddlewareDatasource"]).toBeDefined();
      expect(ctrl.kinds["Vm"]).toBeDefined();
      expect(ctrl.kinds["MiddlewareDomain"]).toBeDefined();
      expect(ctrl.kinds["MiddlewareServerGroup"]).toBeDefined();
      expect(ctrl.kinds["MiddlewareMessaging"]).toBeDefined();
    });
  });


  describe('the mw topology gets correct icons', function () {
    it('in graph elements', function () {
      expect(ctrl.getIcon(mw_manager).icon).toContain("vendor-hawkular");
      expect(ctrl.getIcon(mw_server).icon).toContain("vendor-wildfly");
      expect(ctrl.getIcon(mw_server_wildfly).icon).toContain("vendor-wildfly");
      expect(ctrl.getIcon(mw_server_eap).icon).toContain("vendor-jboss-eap");
      expect(ctrl.getIcon(mw_deployment).fontfamily).toEqual("font-fabulous");
      expect(ctrl.getIcon(mw_datasource).fontfamily).toEqual("FontAwesome");
      expect(ctrl.getIcon(vm).fontfamily).toEqual("PatternFlyIcons-webfont");
      expect(ctrl.getIcon(mw_domain).fontfamily).toEqual("FontAwesome");
      expect(ctrl.getIcon(mw_server_group).fontfamily).toEqual("FontAwesome");
      expect(ctrl.getIcon(mw_messaging).fontfamily).toEqual("FontAwesome");
    });
  });

  describe('dimensions are returned correctly', function () {
    it('for all objects', function () {
      expect(ctrl.getCircleDimensions(mw_manager)).toEqual({x: -20, y: -20, height: 40, width: 40, r: 28});
      expect(ctrl.getCircleDimensions(mw_server)).toEqual({x: -12, y: -12, height: 23, width: 23, r: 19});
      expect(ctrl.getCircleDimensions(mw_server_eap)).toEqual({x: -9, y: -9, height: 18, width: 18, r: 17});
      expect(ctrl.getCircleDimensions(mw_server_wildfly)).toEqual({x: -9, y: -9, height: 18, width: 18, r: 17});
      expect(ctrl.getCircleDimensions(mw_deployment)).toEqual({x: -9, y: -9, height: 18, width: 18, r: 17});
      expect(ctrl.getCircleDimensions(mw_datasource)).toEqual({x: -9, y: -9, height: 18, width: 18, r: 17});
      expect(ctrl.getCircleDimensions(vm)).toEqual({ x: 0, y: 9, height: 40, width: 40, r: 21 });
      expect(ctrl.getCircleDimensions(mw_domain)).toEqual({x: -9, y: -9, height: 18, width: 18, r: 17});
      expect(ctrl.getCircleDimensions(mw_server_group)).toEqual({x: -9, y: -9, height: 18, width: 18, r: 17});
      expect(ctrl.getCircleDimensions(mw_messaging)).toEqual({x: -9, y: -9, height: 18, width: 18, r: 17});
    });
  });

  describe('icon types are returned correctly', function () {
    it('for all objects', function () {
      expect(ctrl.getIcon(mw_manager).type).toEqual("image");
      expect(ctrl.getIcon(mw_server).type).toEqual("image");
      expect(ctrl.getIcon(mw_server_wildfly).type).toEqual("image");
      expect(ctrl.getIcon(mw_server_eap).type).toEqual("image");
      expect(ctrl.getIcon(mw_deployment).type).toEqual("glyph");
      expect(ctrl.getIcon(mw_datasource).type).toEqual("glyph");
      expect(ctrl.getIcon(vm).type).toEqual("glyph");
      expect(ctrl.getIcon(mw_domain).type).toEqual("glyph");
      expect(ctrl.getIcon(mw_server_group).type).toEqual("glyph");
      expect(ctrl.getIcon(mw_messaging).type).toEqual("glyph");
    });
  });

  describe('topologyService renders right colors', function () {
    it('for deployments', function() {
      expect(topologyService.getItemStatusClass(mw_deployment)).toEqual('success');
      expect(topologyService.getItemStatusClass(mw_deployment_disabled)).toEqual('warning');
      expect(topologyService.getItemStatusClass(mw_deployment_unknown)).toEqual('unknown');
    });
    it('for servers', function() {
      expect(topologyService.getItemStatusClass(mw_server)).toEqual('success');
      expect(topologyService.getItemStatusClass(mw_server_wildfly)).toEqual('success');
      expect(topologyService.getItemStatusClass(mw_server_eap)).toEqual('success');
      expect(topologyService.getItemStatusClass(mw_server_down)).toEqual('error');
      expect(topologyService.getItemStatusClass(mw_server_starting)).toEqual('information');
      expect(topologyService.getItemStatusClass(mw_server_reload)).toEqual('warning');
      expect(topologyService.getItemStatusClass(mw_server_unknown)).toEqual('unknown');
    });
  });
});
