angular.module('ManageIQ').controller('middlewareTopologyController', MiddlewareTopologyCtrl);
MiddlewareTopologyCtrl.$inject = ['$scope', '$interval', 'topologyService'];

function MiddlewareTopologyCtrl($scope, $interval, topologyService) {
  ManageIQ.angular.scope = $scope;
  miqHideSearchClearButton();
  var vm = this;
  vm.vs = null;
  var d3 = window.d3;
  vm.d3 = d3;
  vm.dataUrl = '/middleware_topology/data';

  topologyService.mixinContextMenu(vm, vm);

  vm.checkboxModel = {
    value: false,
  };
  vm.legendTooltip = 'Click here to show/hide entities of this type';

  $('input#box_display_names').click(topologyService.showHideNames(vm));
  topologyService.mixinRefresh(vm, $scope);
  vm.refresh();
  var promise = $interval(vm.refresh, 1000 * 60 * 3);

  $scope.$on('$destroy', function() {
    $interval.cancel(promise);
  });

  $scope.$on('render', function(ev, vertices, added) {
    /*
     * We are passed two selections of <g> elements:
     * vertices: All the elements
     * added: Just the ones that were added
     */
    added.attr('class', function(d) {
      return d.item.kind;
    });
    added.append('circle')
      .attr('r', function(d) {
        return vm.getCircleDimensions(d).r;
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
        return (iconInfo.type === 'glyph' ? null : iconInfo.icon);
      })
      .attr('y', function(d) {
        return vm.getCircleDimensions(d).y;
      })
      .attr('x', function(d) {
        return vm.getCircleDimensions(d).x;
      })
      .attr('height', function(d) {
        return vm.getCircleDimensions(d).height;
      })
      .attr('width', function(d) {
        return vm.getCircleDimensions(d).width;
      })
      .on('contextmenu', function(d) {
        vm.contextMenu(this, d);
      });

    // attached labels
    added.append('text')
      .attr('x', 26)
      .attr('y', 24)
      .text(function(d) {
        return d.item.name;
      })
      .attr('class', 'attached-label' + (vm.checkboxModel.value ? ' visible' : ''));

    // possible glyphs
    added.append('text')
      .each(function(d) {
        var iconInfo = vm.getIcon(d);
        if (iconInfo.type != 'glyph') {
          return;
        }
        /* global fontIconChar */
        var fonticon = fontIconChar(iconInfo.class);
        var fontFamily = 'font-family:' + fonticon.font + ';';
        $(this).text(fonticon.char)
          .attr('class', 'glyph')
          .attr('style', fontFamily)
          .attr('x', 0)
          .attr('y', 8);

        // override some properties for container glyph, because it looks too small and alignment is wrong
        if (d.item.kind === 'Container') {
          $(this).text(fonticon.char)
            .attr('style', 'font-size: 20px;' + fontFamily)
            .attr('y', 7);
        }
      })
      .on('contextmenu', function(d) {
        vm.contextMenu(this, d);
      });

    added.selectAll('title').text(function(d) {
      return topologyService.tooltip(d).join('\n');
    });
    vm.vs = vertices;

    /* Don't do default rendering */
    ev.preventDefault();
  });

  vm.getIcon = function getIcon(d) {
    if (d.item.icon) {
      return {
        'type': 'image',
        'icon': d.item.icon,
      };
    }

    return vm.icons[d.item.display_kind];
  };

  vm.getCircleDimensions = function getCircleDimensions(d) {
    var defaultDimensions = topologyService.defaultElementDimensions();
    switch (d.item.kind) {
      case 'MiddlewareManager':
        return {
          x: -20,
          y: -20,
          height: 40,
          width: 40,
          r: 28,
        };
      case 'MiddlewareServer':
        return {
          x: -12,
          y: -12,
          height: 23,
          width: 23,
          r: 19,
        };
      case 'Vm':
        return {
          x: defaultDimensions.x,
          y: defaultDimensions.y,
          height: 40,
          width: 40,
          r: 21,
        };
      default:
        return {
          x: -9,
          y: -9,
          height: 18,
          width: 18,
          r: defaultDimensions.r,
        };
    }
  };
  topologyService.mixinSearch(vm);
}
