angular.module('ManageIQ').controller('containerTopologyController', ContainerTopologyCtrl);
ContainerTopologyCtrl.$inject = ['$scope', 'topologyService', 'topologyDetail'];

function ContainerTopologyCtrl($scope, topologyService, topologyDetail) {
  var vm = this;
  vm.dataUrl = topologyDetail ? '/container_project_topology/data' : '/container_topology/data';
  vm.vs = null;
  vm.icons = null;

  vm.remove_hierarchy = [
    'Container',
    'ContainerGroup',
    'ContainerReplicator',
    'ContainerService',
    'ContainerRoute',
    'Host',
    'Vm',
    'ContainerNode',
    'ContainerManager',
  ];

  topologyService.mixinTopology(vm, $scope);

  $scope.$on('render', function(ev, vertices, added) {
    /*
     * We are passed two selections of <g> elements:
     * vertices: All the elements
     * added: Just the ones that were added
     */

    /*
      If we remove some kinds beforehand, and then try to bring them back we
      get the hash {kind: undefined} instead of {kind: true}.
    */
    if (vm.kinds) {
      Object.keys(vm.kinds).forEach(function(key) {
        vm.kinds[key] = true;
      });
    }

    added.attr('class', function(d) {
      return d.item.kind;
    });

    added.append('circle')
      .attr('r', function(d) {
        return vm.getDimensions(d).r;
      })
      .attr('class', function(d) {
        return topologyService.getItemStatusClass(d);
      })
      .on('contextmenu', function(d) {
        vm.contextMenu(this, d);
      });

    added.append('title');

    added.on('dblclick', function(d) {
      return vm.dblclick(d);
    });

    added.append('image')
      .attr('xlink:href', function(d) {
        var iconInfo = vm.getIcon(d);
        return iconInfo.type === 'image' ? iconInfo.icon : null;
      })
      .attr('height', function(d) {
        var iconInfo = vm.getIcon(d);
        if (iconInfo.type !== 'image') {
          return 0;
        }
        return 40;
      })
      .attr('width', function(d) {
        var iconInfo = vm.getIcon(d);
        if (iconInfo.type !== 'image') {
          return 0;
        }
        return 40;
      })
      .attr('y', function(d) {
        return vm.getDimensions(d).y;
      })
      .attr('x', function(d) {
        return vm.getDimensions(d).x;
      })
      .on('contextmenu', function(d) {
        vm.contextMenu(this, d);
      });

    added.append('text')
      .each(function(d) {
        var iconInfo = vm.getIcon(d);
        if (iconInfo.type != 'glyph') {return;}

        /* global fontIconChar */
        var fonticon = fontIconChar(iconInfo.class);
        $(this).text(fonticon.char)
          .attr('class', 'glyph')
          .attr('font-family', fonticon.font);
      })

      .attr('y', function(d) {
        return vm.getDimensions(d).y;
      })
      .attr('x', function(d) {
        return vm.getDimensions(d).x;
      })
      .on('contextmenu', function(d) {
        vm.contextMenu(this, d);
      });


    added.append('text')
      .attr('x', 26)
      .attr('y', 24)
      .text(function(d) {
        return d.item.name;
      })
      .attr('class', function() {
        var class_name = 'attached-label';
        return vm.checkboxModel.value ? class_name + ' visible' : class_name;
      });

    added.selectAll('title').text(function(d) {
      return topologyService.tooltip(d).join('\n');
    });
    vm.vs = vertices;
    /* Don't do default rendering */
    ev.preventDefault();
  });

  vm.getDimensions = function getDimensions(d) {
    var defaultDimensions = topologyService.defaultElementDimensions();
    switch (d.item.kind) {
      case 'ContainerManager':
        return { x: -20, y: -20, r: 28 };
      case 'ContainerProject':
        return { x: defaultDimensions.x, y: defaultDimensions.y, r: 28 };
      case 'Container':
        return { x: 1, y: 5, r: 13 };
      case 'ContainerGroup':
        return { x: 1, y: 6, r: defaultDimensions.r };
      case 'ContainerService':
        return { x: -2, y: defaultDimensions.y, r: defaultDimensions.r };
      case 'ContainerReplicator':
        return { x: -1, y: 8, r: defaultDimensions.r };
      case 'ContainerNode':
      case 'Vm':
      case 'Host':
        return { x: defaultDimensions.x, y: defaultDimensions.y, r: 21 };
      default:
        return defaultDimensions;
    }
  };
}
