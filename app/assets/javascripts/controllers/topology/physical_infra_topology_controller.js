angular.module('ManageIQ').controller('physicalInfraTopologyController', physicalInfraTopologyCtrl);
physicalInfraTopologyCtrl.$inject = ['$scope', '$http', '$interval', '$location', 'topologyService', 'miqService'];

function physicalInfraTopologyCtrl($scope, $http, $interval, $location, topologyService, miqService) {
  ManageIQ.angular.scope = $scope;
  miqHideSearchClearButton();
  var self = this;
  $scope.vs = null;
  var icons = null;

  var d3 = window.d3;
  $scope.d3 = d3;

  topologyService.mixinContextMenu(this, $scope);

  $scope.refresh = function() {
    var id;
    if ($location.absUrl().match("show/$") || $location.absUrl().match("show$")) {
      id = '';
    } else {
      id = '/' + (/physical_infra_topology\/show\/(\d+)/.exec($location.absUrl())[1]);
    }

    var url = '/physical_infra_topology/data' + id;

    $http.get(url)
      .then(getPhysicalInfraTopologyData)
      .catch(miqService.handleFailure);
  };

  $scope.checkboxModel = {
    value: false
  };

  $scope.legendTooltip = __("Click here to show/hide entities of this type");

  $('input#box_display_names').click(topologyService.showHideNames($scope));
  $scope.refresh();
  var promise = $interval($scope.refresh, 1000 * 60 * 3);

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
        return self.getDimensions(d).r;
      })
      .attr('class', function(d) {
        return topologyService.getItemStatusClass(d);
      })
      .on("contextmenu", function(d) {
        self.contextMenu(this, d);
      });

    added.append("title");

    added.on("dblclick", function(d) {
      return self.dblclick(d);
    });

    added.append("image")
      .attr("xlink:href", function (d) {
        var iconInfo = self.getIcon(d);
        switch(iconInfo.type) {
          case 'image':
            return iconInfo.icon;
          case "glyph":
            return null;
        }
      })
      .attr("height", function(d) {
        var iconInfo = self.getIcon(d);
        if (iconInfo.type != 'image') {
          return 0;
        }
        return 40;
      })
      .attr("width", function(d) {
        var iconInfo = self.getIcon(d);
        if (iconInfo.type != 'image') {
          return 0;
        }
        return 40;
      })
      .attr("y", function(d) {
        return self.getDimensions(d).y;
      })
      .attr("x", function(d) {
        return self.getDimensions(d).x;
      })
      .on("contextmenu", function(d) {
        self.contextMenu(this, d);
      });

    added.append("text")
      .each(function(d) {
        var iconInfo = self.getIcon(d);
        if (iconInfo.type != 'glyph')
          return;

        /* global fontIconChar */
        var fonticon = fontIconChar(iconInfo.class);
        $(this).text(fonticon.char)
          .attr("class", "glyph")
          .attr('font-family', fonticon.font);
      })

      .attr("y", function(d) {
        return self.getDimensions(d).y;
      })
      .attr("x", function(d) {
        return self.getDimensions(d).x;
      })
      .on("contextmenu", function(d) {
        self.contextMenu(this, d);
      });

    added.append("text")
      .attr("x", 26)
      .attr("y", 24)
      .text(function(d) {
        return d.item.name;
      })
      .attr('class', function() {
        var class_name = "attached-label";
        if ($scope.checkboxModel.value) {
          return class_name + ' visible';
        } else {
          return class_name;
        }
      });

    added.selectAll("title").text(function(d) {
      return topologyService.tooltip(d).join("\n");
    });

    $scope.vs = vertices;

    /* Don't do default rendering */
    ev.preventDefault();
  });

  this.getIcon = function getIcon(d) {
    switch(d.item.kind) {
      case 'PhysicalInfraManager':
        return icons[d.item.display_kind];
      default:
        return icons[d.item.kind];
    }
  };

  this.getDimensions = function getDimensions(d) {
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

  function getPhysicalInfraTopologyData(response) {
    var data = response.data;

    var currentSelectedKinds = $scope.kinds;

    $scope.items = data.data.items;
    $scope.relations = data.data.relations;
    $scope.kinds = data.data.kinds;
    icons = data.data.icons;

    if (currentSelectedKinds && (Object.keys(currentSelectedKinds).length !== Object.keys($scope.kinds).length)) {
      $scope.kinds = currentSelectedKinds;
    }
  }

  topologyService.mixinSearch($scope);
}
