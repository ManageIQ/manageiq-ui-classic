describe('topologyService', function() {
    var testService;
    var replicator = { id:"396086e5-7b0d-11e5-8286-18037327aaeb",  item:{display_kind:"Replicator", kind:"ContainerReplicator", id:"396086e5-7b0d-11e5-8286-18037327aaeb", miq_id:"10"}};

    beforeEach(module('ManageIQ'));

    beforeEach(inject(function(topologyService) {
      testService = topologyService;
    }));

    describe('tooltips have correct content', function() {
      it('of all objects', function() {
        var d = { id:"2",  item:{display_kind:"Openshift", kind:"ContainerManager", id:"2", miq_id:"37", status: "Unreachable", name:"molecule"}};
        expect(testService.tooltip(d)).toEqual([ 'Name: molecule', 'Type: Openshift', 'Status: Unreachable' ] );
        d = { id:"3",  item:{display_kind:"Pod", kind:"ContainerGroup", id:"3", miq_id:"30", status: "Running", name:"mypod"}};
        expect(testService.tooltip(d)).toEqual([ 'Name: mypod', 'Type: Pod', 'Status: Running' ] );
        d = { id:"4",  item:{display_kind:"VM", kind:"Vm", id:"4", miq_id:"25", status: "On", name:"vm123", provider: "myrhevprovider"}};
        expect(testService.tooltip(d)).toEqual([ 'Name: vm123', 'Type: VM', 'Status: On', 'Provider: myrhevprovider' ]);
      });
    });

    describe('the dbl click gets correct navigation url', function() {
      it('to entity pages', function() {
        var d = { id:"2",  item:{display_kind:"Openshift", kind:"ContainerManager", id:"2", miq_id:"37"}};
        expect(testService.geturl(d)).toEqual("/ems_container/37");
        d = { id:"3",  item:{display_kind:"Pod", kind:"ContainerGroup", id:"3", miq_id:"30"}};
        expect(testService.geturl(d)).toEqual("/container_group/show/30");
        d = { id:"4",  item:{display_kind:"VM", kind:"Vm", id:"4", miq_id:"25"}};
        expect(testService.geturl(d)).toEqual("/vm/show/25");
        expect(testService.geturl(replicator)).toEqual("/container_replicator/show/10");
      });
    });

  describe('browser url to json endopoint url conversion', function() {
    var controller;

    beforeEach(function() {
      controller = {};
      testService.mixinRefresh(controller);
    });

    context('cloud', function() {
      beforeEach(function() {
        controller.dataUrl = '/cloud_topology/data';

        testService.mixinRefresh(controller);
      });

      it('Compute > Cloud > Topology', function() {
        var url = controller.parseUrl('/cloud_topology/show');
        expect(url).toEqual('/cloud_topology/data');
      });

      it('Compute > Cloud > Providers > detail > Topology', function() {
        var url = controller.parseUrl('/cloud_topology/show/10000000000004');
        expect(url).toEqual('/cloud_topology/data/10000000000004');
      });
    });

    context('container', function() {
      beforeEach(function() {
        controller.dataUrl = '/container_topology/data';
        testService.mixinRefresh(controller);
      });

      it('Compute > Containers > Topology', function() {
        var url = controller.parseUrl('/container_topology/show');
        expect(url).toEqual('/container_topology/data');
      });

      it('Compute > Containers > Providers > detail > Topology', function() {
        var url = controller.parseUrl('/ems_container/10000000000040?display=topology')
        expect(url).toEqual('/container_topology/data/10000000000040');
      });
    });

    context('container project', function() {
      beforeEach(function() {
        controller.dataUrl = '/container_project_topology/data';
        testService.mixinRefresh(controller);
      });

      it('Compute > Containers > Projects > detail > Topology', function() {
        var url = controller.parseUrl('/container_project/show/10000000000001?display=topology');
        expect(url).toEqual('/container_project_topology/data/10000000000001');
      });
    });

    context('infra', function() {
      beforeEach(function() {
        controller.dataUrl = '/infra_topology/data';

        testService.mixinRefresh(controller);
      });

      it('Compute > Infrastructure > Topology', function() {
        var url = controller.parseUrl('/infra_topology/show');
        expect(url).toEqual('/infra_topology/data');
      });

      it('Compute > Infrastructure > Providers > detail > Topology', function() {
        var url = controller.parseUrl('/infra_topology/show/10000000000028');
        expect(url).toEqual('/infra_topology/data/10000000000028');
      });
    });

    context('network', function() {
      beforeEach(function () {
        controller.dataUrl = '/network_topology/data';

        testService.mixinRefresh(controller);
      });
      it('Networks > Topology', function() {
        var url = controller.parseUrl('/network_topology/show');
        expect(url).toEqual('/network_topology/data');
      });

      it('Networks > Providers > detail > Topology', function() {
        var url = controller.parseUrl('/network_topology/show/10000000000005');
        expect(url).toEqual('/network_topology/data/10000000000005');
      });

      it('works with a hash url', function() {
        var url = controller.parseUrl('/network_topology/show/4#/');
        expect(url).toEqual('/network_topology/data/4');
      });
    })

    context('physical infra', function() {
      beforeEach(function() {
        controller.dataUrl = '/physical_infra_topology/data';

        testService.mixinRefresh(controller);
      });

      it('Compute > Physical Infrastructure > Topology', function() {
        var url = controller.parseUrl('/physical_infra_topology/show');
        expect(url).toEqual('/physical_infra_topology/data');
      });

      // TODO: physical infrastructure - topology from detail screen, add once there is a working detail screen
    });
  });
});
