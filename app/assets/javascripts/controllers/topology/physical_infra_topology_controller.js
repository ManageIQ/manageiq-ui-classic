angular.module('ManageIQ').controller('physicalInfraTopologyController', physicalInfraTopologyCtrl);
physicalInfraTopologyCtrl.$inject = ['$scope', '$interval', 'topologyService'];

function physicalInfraTopologyCtrl($scope, $interval, topologyService) {
  miqHideSearchClearButton();
  var vm = this;
  vm.vs = null;
  vm.icons = null;
  vm.dataUrl = '/physical_infra_topology/data';

  var d3 = window.d3;
  vm.d3 = d3;

  topologyService.mixinContextMenu(vm, vm);

  vm.checkboxModel = {
    value: false
  };

  vm.legendTooltip = __("Click here to show/hide entities of this type");

  $('input#box_display_names').click(topologyService.showHideNames(vm));
  topologyService.mixinRefresh(vm, $scope);
  topologyService.mixinGetIcon(vm);
  vm.refresh();
  var promise = $interval(vm.refresh, 1000 * 60 * 3);

  $scope.$on('$destroy', function() {
    $interval.cancel(promise);
  });

  $scope.$on("render", function(ev, vertices, added) {
    /*
     * We are passed two selections of <g> elements:
     * vertices: All the elements
     * added: Just the ones that were added
     */

    added.attr("class", function(d) {
      return d.item.kind;
    });

    added.append("circle")
      .attr("r", function(d) {
        return vm.getDimensions(d).r;
      })
      .attr('class', function(d) {
        return topologyService.getItemStatusClass(d);
      })
      .on("contextmenu", function(d) {
        vm.contextMenu(this, d);
      });

    added.append("title");

    added.on("dblclick", function(d) {
      return vm.dblclick(d);
    });

    added.append("image")
      .attr("xlink:href", function (d) {
        var iconInfo = vm.getIcon(d);
        switch(iconInfo.type) {
          case 'image':
            return iconInfo.icon;
          case "glyph":
            return null;
        }
      })
      .attr("height", function(d) {
        var iconInfo = vm.getIcon(d);
        if (iconInfo.type != 'image') {
          return 0;
        }
        return 40;
      })
      .attr("width", function(d) {
        var iconInfo = vm.getIcon(d);
        if (iconInfo.type != 'image') {
          return 0;
        }
        return 40;
      })
      .attr("y", function(d) {
        return vm.getDimensions(d).y;
      })
      .attr("x", function(d) {
        return vm.getDimensions(d).x;
      })
      .on("contextmenu", function(d) {
        vm.contextMenu(this, d);
      });

    added.append("text")
      .each(function(d) {
        var iconInfo = vm.getIcon(d);
        if (iconInfo.type !== 'glyph')
          return;

        /* global fontIconChar */
        var fonticon = fontIconChar(iconInfo.class);
        $(this).text(fonticon.char)
          .attr("class", "glyph")
          .attr('font-family', fonticon.font);
      })

      .attr("y", function(d) {
        return vm.getDimensions(d).y;
      })
      .attr("x", function(d) {
        return vm.getDimensions(d).x;
      })
      .on("contextmenu", function(d) {
        vm.contextMenu(this, d);
      });

    added.append("text")
      .attr("x", 26)
      .attr("y", 24)
      .text(function(d) {
        return d.item.name;
      })
      .attr('class', function() {
        var class_name = "attached-label";
        if (vm.checkboxModel.value) {
          return class_name + ' visible';
        } else {
          return class_name;
        }
      });

    added.selectAll("title").text(function(d) {
      return topologyService.tooltip(d).join("\n");
    });

    vm.vs = vertices;

    /* Don't do default rendering */
    ev.preventDefault();
  });

  vm.getDimensions = function getDimensions(d) {
    var defaultDimensions = topologyService.defaultElementDimensions();
    switch (d.item.kind) {
      case "PhysicalInfraManager":
        return { x: -20, y: -20, r: 28 };
      case "EmsCluster":
        return { x: defaultDimensions.x, y: defaultDimensions.y, r: defaultDimensions.r };
      case "Host":
        return { x: defaultDimensions.x, y: defaultDimensions.y, r: defaultDimensions.r };
      case "Tag":
        return { x: defaultDimensions.x, y: defaultDimensions.y, r: 13 };
      default:
        return defaultDimensions;
    }
  };
  topologyService.mixinSearch(vm);
}
