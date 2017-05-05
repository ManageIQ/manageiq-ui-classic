ManageIQ.angular.app.service('topologyService', function() {
  this.tooltip = function tooltip(d) {
    var status = [
      __("Name: ") + d.item.name,
      __("Type: ") + d.item.display_kind,
      __("Status: ") + d.item.status
    ];

    if (d.item.kind === 'Host' || d.item.kind === 'Vm') {
      status.push(__("Provider: ") + d.item.provider);
    }

    return status;
  };

  this.showHideNames = function($scope) {
    return function () {
      $scope.checkboxModel.value = $('input#box_display_names')[0].checked;
      var vertices = $scope.vs;

      if ($scope.checkboxModel.value) {
        vertices.selectAll("text.attached-label")
          .classed("visible", true);
      } else {
        vertices.selectAll("text.attached-label")
          .classed("visible", false);
      }
    }
  };

  this.mixinContextMenu = function(self, $scope) {
    var topologyService = this;
    var d3 = $scope.d3;
    $scope.contextMenuShowing = false;

    var removeContextMenu = function() {
      d3.event.preventDefault();
      d3.select(".popup").remove();
      $scope.contextMenuShowing = false;
    };

    self.contextMenu = function(_that, data) {
      if ($scope.contextMenuShowing) {
        removeContextMenu();
      } else {
        d3.event.preventDefault();

        var canvas = d3.select("kubernetes-topology-graph");
        var mousePosition = d3.mouse(canvas.node());

        var popup = canvas.append("div")
            .attr("class", "popup")
            .style("left", mousePosition[0] + "px")
            .style("top", mousePosition[1] + "px");
        popup.append("h5").text("Actions on " + data.item.display_kind);

        if (data.item.kind != "Tag") {
          popup.append("p").text(__('Go to summary page')).on('click', function() {
            self.dblclick(data);
          });
        }

        var canvasSize = [
          canvas.node().offsetWidth,
          canvas.node().offsetHeight
        ];

        var popupSize = [
          popup.node().offsetWidth,
          popup.node().offsetHeight
        ];

        if (popupSize[0] + mousePosition[0] > canvasSize[0]) {
          popup.style("left", "auto");
          popup.style("right", 0);
        }

        if (popupSize[1] + mousePosition[1] > canvasSize[1]) {
          popup.style("top", "auto");
          popup.style("bottom", 0);
        }
        $scope.contextMenuShowing = ! $scope.contextMenuShowing;
      }
    }

    self.dblclick = function dblclick(d) {
      if (d.item.kind == "Tag") {
        return false;
      }
      window.location.assign(topologyService.geturl(d));
    };

    d3.select("body").on('click', function() {
      if ($scope.contextMenuShowing) {
        removeContextMenu();
      }
    });
  };

  this.searchNode = function(svg, query) {
    var nodes = svg.selectAll("g");
    nodes.style("opacity", "1");

    var found = true;

    if (query != "") {
      var selected = nodes.filter(function (d) {
        return d.item.name.indexOf(query) === -1;
      });
      selected.style("opacity", "0.2");

      var links = svg.selectAll("line");
      links.style("opacity", "0.2");

      if (nodes.length === selected.length) {
        found = false;
      }
    }

    return found;
  };

  this.resetSearch = function(d3) {
    // Display all topology nodes and links
    d3.selectAll("g, line").transition()
      .duration(2000)
      .style("opacity", 1);
  };

  this.geturl = function(d) {
    var entity_url = "";
    var action = '/';

    switch (d.item.kind) {
      case "ContainerManager":
        entity_url = "ems_container";
        break;
      case "PhysicalInfraManager":
        entity_url = "ems_physical_infra";
        break;
      case "NetworkManager":
        entity_url = "ems_network";
        break;
      case "MiddlewareManager":
        entity_url = "ems_middleware";
        break;
      case "InfraManager":
        entity_url = "ems_infra";
        break;
      case "CloudManager":
        entity_url = "ems_cloud";
        break;
      default : // for non provider entities, use the show action
        action = '/show/';
        entity_url = _.snakeCase(d.item.kind);
      }
      return '/' + entity_url + action + d.item.miq_id;
  };

  this.getSVG = function(d3) {
    var graph = d3.select("kubernetes-topology-graph");
    var svg = graph.select('svg');
    return svg;
  };

  this.defaultElementDimensions = function() {
    return { x: 0, y: 9, r: 17 };
  };

  this.getItemStatusClass = function(d) {
    switch (d.item.status) {
      case "OK":
      case "Active":
      case "Available":
      case "On":
      case "Ready":
      case "Running":
      case "Succeeded":
      case "Valid":
        return "success";
      case "NotReady":
      case "Failed":
      case "Error":
      case "Unreachable":
        return "error";
      case 'Warning':
      case 'Waiting':
      case 'Pending':
        return "warning";
      case 'Unknown':
      case 'Terminated':
        return "unknown";
    }
  };

  this.reduce_kinds = function(items, kinds, size_limit, remove_hierarchy) {
    var tmp_list = _.values(items);
    var kind_index = 0;
    while ((tmp_list.length > size_limit) && kind_index < remove_hierarchy.length) {
      var kind_to_hide = remove_hierarchy[kind_index];
      tmp_list = tmp_list.filter(function(item) {
        return item['kind'] != kind_to_hide;
      });
      kind_index++;
      delete kinds[kind_to_hide]
    }
    return kinds
  };

  // this injects some common code in the controller - temporary pending a proper merge
  this.mixinSearch = function($scope) {
    var topologyService = this;

    $scope.searching = false;
    $scope.notFound = false;

    $scope.searchNode = function() {
      var svg = topologyService.getSVG($scope.d3);
      var query = $('input#search_topology')[0].value;

      $scope.searching = true;
      $scope.notFound = ! topologyService.searchNode(svg, query);
    };

    $scope.resetSearch = function() {
      topologyService.resetSearch($scope.d3);

      // Reset the search term in search input
      $('input#search_topology')[0].value = "";

      $scope.searching = false;
      $scope.notFound = false;
    };
  };
});
