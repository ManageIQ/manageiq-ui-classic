angular.module('ManageIQ').controller('containerTopologyController', ContainerTopologyCtrl);
ContainerTopologyCtrl.$inject = ['$scope', '$http', '$interval', 'topologyService', '$window', 'miqService'];

function ContainerTopologyCtrl($scope, $http, $interval, topologyService, $window, miqService) {
  ManageIQ.angular.scope = $scope;
  miqHideSearchClearButton();
  var self = this;
  $scope.vs = null;
  var icons = null;

  var d3 = window.d3;
  $scope.d3 = d3;

  topologyService.mixinContextMenu(this, $scope);

  $scope.refresh = function() {
    var id, type;
    var pathname = $window.location.pathname.replace(/\/$/, '');
    if (pathname.match('/container_topology/show$')) {
      // specifically the container_topology page - all container ems's
      type = 'container_topology';
      id = '';
    } else if (pathname.match('/(.+)/show/([0-9]+)')) {
      // any container entity except the ems
      // search for pattern ^/<controller>/show/<id>$ in the pathname - /container_project/show/11
      var arr = pathname.match('/(.+)/show/([0-9]+)');
      type = arr[1] + '_topology';
      id = '/' + arr[2]
    } else if (pathname.match('/(.+)/([0-9]+)')) {
      // single entity topology of ems_container
      // search for pattern ^/<controller>/<id>$ in the pathname - /ems_container/4
      var arr = pathname.match('/(.+)/([0-9]+)');
      type = 'container_topology';
      id = '/' + arr[2]
    }

    var url = '/' + type + '/data' + id;

    $http.get(url)
      .then(getContainerTopologyData)
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

    /*
      If we remove some kinds beforehand, and then try to bring them back we
      get the hash {kind: undefined} instead of {kind: true}.
    */
    if ($scope.kinds) {
      Object.keys($scope.kinds).forEach(function (key) {
        $scope.kinds[key] = true
      });
    }

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
      case 'ContainerManager':
        return icons[d.item.display_kind];
      default:
        return icons[d.item.kind];
    }
  };

  this.getDimensions = function getDimensions(d) {
    var defaultDimensions = topologyService.defaultElementDimensions();
    switch (d.item.kind) {
      case "ContainerManager":
        return { x: -20, y: -20, r: 28 };
      case "ContainerProject":
        return { x: defaultDimensions.x, y: defaultDimensions.y, r: 28 };
      case "Container":
        return { x: 1, y: 5, r: 13 };
      case "ContainerGroup":
        return { x: 1, y: 6, r: defaultDimensions.r };
      case "ContainerService":
        return { x: -2, y: defaultDimensions.y, r: defaultDimensions.r };
      case "ContainerReplicator":
        return { x: -1, y: 8, r: defaultDimensions.r };
      case "ContainerNode":
      case "Vm":
      case "Host":
        return { x: defaultDimensions.x, y: defaultDimensions.y, r: 21 };
      default:
        return defaultDimensions;
    }
  };

  function getContainerTopologyData(response) {
    var data = response.data;

    var currentSelectedKinds = $scope.kinds;

    $scope.items = data.data.items;
    $scope.relations = data.data.relations;
    $scope.kinds = data.data.kinds;
    icons = data.data.icons;
    var size_limit = data.data.settings.containers_max_objects;

    if (currentSelectedKinds && (Object.keys(currentSelectedKinds).length !== Object.keys($scope.kinds).length)) {
      $scope.kinds = currentSelectedKinds;
    } else if (size_limit > 0) {
      var remove_hierarchy = ['Container',
        'ContainerGroup',
        'ContainerReplicator',
        'ContainerService',
        'ContainerRoute',
        'Host',
        'Vm',
        'ContainerNode',
        'ContainerManager'];
      $scope.kinds = topologyService.reduce_kinds($scope.items, $scope.kinds, size_limit, remove_hierarchy);
    }
  }

  topologyService.mixinSearch($scope);
}
