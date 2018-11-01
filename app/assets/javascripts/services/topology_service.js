ManageIQ.angular.app.service('topologyService', ['$location', '$http', 'miqService', '$timeout', '$interval', '$window', function($location, $http, miqService, $timeout, $interval, $window) {
  this.tooltip = function tooltip(d) {
    var status = [
      __('Name: ') + d.item.name,
      __('Type: ') + d.item.display_kind,
      __('Status: ') + d.item.status,
    ];

    if (d.item.kind === 'Tag') {
      status = [
        d.item.name,
        __('Type: ') + d.item.display_kind,
      ];
    }

    if (d.item.kind === 'Host' || d.item.kind === 'Vm') {
      status.push(__('Provider: ') + d.item.provider);
    }

    return status;
  };

  this.showHideNames = function($scope) {
    return function() {
      $scope.checkboxModel.value = $('input#box_display_names')[0].checked;
      var vertices = $scope.vs;

      if ($scope.checkboxModel.value) {
        vertices.selectAll('text.attached-label')
          .classed('visible', true);
      } else {
        vertices.selectAll('text.attached-label')
          .classed('visible', false);
      }
    };
  };

  this.mixinContextMenu = function(vm) {
    var topologyService = this;
    vm.contextMenuShowing = false;

    var removeContextMenu = function() {
      d3.event.preventDefault();
      d3.select('.popup').remove();
      vm.contextMenuShowing = false;
    };

    vm.contextMenu = function(_that, data) {
      if (vm.contextMenuShowing) {
        removeContextMenu();
      } else {
        d3.event.preventDefault();

        var canvas = d3.select('kubernetes-topology-graph');
        var mousePosition = d3.mouse(canvas.node());

        var popup = canvas.append('div')
          .attr('class', 'popup')
          .style('left', mousePosition[0] + 'px')
          .style('top', mousePosition[1] + 'px');
        popup.append('h5').text('Actions on ' + data.item.display_kind);

        if (data.item.kind !== 'Tag') {
          popup.append('p').text(__('Go to summary page')).on('click', function() {
            vm.dblclick(data);
          });
        }

        var canvasSize = [
          canvas.node().offsetWidth,
          canvas.node().offsetHeight,
        ];

        var popupSize = [
          popup.node().offsetWidth,
          popup.node().offsetHeight,
        ];

        if (popupSize[0] + mousePosition[0] > canvasSize[0]) {
          popup.style('left', 'auto');
          popup.style('right', 0);
        }

        if (popupSize[1] + mousePosition[1] > canvasSize[1]) {
          popup.style('top', 'auto');
          popup.style('bottom', 0);
        }
        vm.contextMenuShowing = ! vm.contextMenuShowing;
      }
    };

    vm.dblclick = function dblclick(d) {
      if (d.item.kind === 'Tag') {
        return false;
      }
      $window.location.assign(topologyService.geturl(d));
    };

    d3.select('body').on('click', function() {
      if (vm.contextMenuShowing) {
        removeContextMenu();
      }
    });
  };

  this.searchNode = function(svg, query) {
    var nodes = svg.selectAll('g');
    nodes.style('opacity', '1');
    var found = true;
    if (query !== '') {
      var selected = nodes.filter(function(d) {
        return d.item.name.toLowerCase().indexOf(query.toLowerCase()) === -1;
      });
      selected.style('opacity', '0.2');

      var links = svg.selectAll('line');
      links.style('opacity', '0.2');

      if (nodes.size() === selected.size()) {
        found = false;
      }
    }

    return found;
  };

  this.resetSearch = function(d3) {
    // Display all topology nodes and links
    d3.selectAll('g, line').transition()
      .duration(2000)
      .style('opacity', 1);
  };

  this.geturl = function(d) {
    var entity_url = '';
    var action = '/';

    switch (d.item.kind) {
      case 'ContainerManager':
        entity_url = 'ems_container';
        break;
      case 'PhysicalInfraManager':
        entity_url = 'ems_physical_infra';
        break;
      case 'NetworkManager':
        entity_url = 'ems_network';
        break;
      case 'InfraManager':
        entity_url = 'ems_infra';
        break;
      case 'CloudManager':
        entity_url = 'ems_cloud';
        break;
      default : // for non provider entities, use the show action
        action = '/show/';
        entity_url = _.snakeCase(d.item.kind);
    }
    return '/' + entity_url + action + d.item.miq_id;
  };

  this.getSVG = function(d3) {
    var graph = d3.select('kubernetes-topology-graph');
    var svg = graph.select('svg');
    return svg;
  };

  this.defaultElementDimensions = function() {
    return { x: 0, y: 9, r: 17 };
  };

  this.getItemStatusClass = function(d) {
    switch (d.item.status) {
      case 'OK':
      case 'Active':
      case 'Available':
      case 'On':
      case 'Ready':
      case 'Running':
      case 'Succeeded':
      case 'Valid':
        return 'success';
      case 'NotReady':
      case 'Failed':
      case 'Error':
      case 'Unreachable':
      case 'Inactive':
      case 'Critical':
        return 'error';
      case 'Warning':
      case 'Waiting':
      case 'Pending':
        return 'warning';
      case 'Unknown':
      case 'Terminated':
        return 'unknown';
    }
  };

  this.reduce_kinds = function(items, kinds, size_limit, remove_hierarchy) {
    var tmp_list = _.values(items);
    var kind_index = 0;
    while ((tmp_list.length > size_limit) && kind_index < remove_hierarchy.length) {
      var kind_to_hide = remove_hierarchy[kind_index];
      tmp_list = tmp_list.filter(function(item) {
        return item.kind !== kind_to_hide;
      });
      kind_index++;
      delete kinds[kind_to_hide];
    }
    return kinds;
  };

  // this injects some common code in the controller - temporary pending a proper merge
  this.mixinSearch = function($scope) {
    var topologyService = this;

    var resetEvent = function() {
      topologyService.resetSearch($scope.d3);
      $('input#search_topology')[0].value = '';
      $scope.searching = false;
      $scope.notFound = false;
    };

    $scope.searching = false;
    $scope.notFound = false;
    $scope.resetSearch = resetEvent;

    // listen for search & reset events
    listenToRx(function(event) {
      if (event.service !== 'topologyService') {
        return;
      }

      $timeout(function() {
        switch (event.name) {
          case 'searchNode':
            $scope.searching = true;
            var svg = topologyService.getSVG($scope.d3);
            var query = $('input#search_topology')[0].value;
            $scope.notFound = ! topologyService.searchNode(svg, query);
            break;

          case 'resetSearch':
            resetEvent();
            break;
        }
      });
    });
  };

  this.mixinRefresh = function(controller, $scope) {
    var topologyService = this;
    var getTopologyData = function(response) {
      var data = response.data;
      var currentSelectedKinds = controller.kinds;
      controller.items = data.data.items;
      controller.relations = data.data.relations;
      // NOTE: $scope.kinds is required by kubernetes icons used for filtering
      controller.kinds = $scope.kinds = data.data.kinds;
      controller.filters = $scope.filters = {};
      controller.icons = data.data.icons;
      if (currentSelectedKinds && (Object.keys(currentSelectedKinds).length !== Object.keys(controller.kinds).length)) {
        controller.kinds = $scope.kinds = currentSelectedKinds;
      } else if (controller.remove_hierarchy && data.data.settings && data.data.settings.containers_max_items) {
        var size_limit = data.data.settings.containers_max_items;
        controller.kinds = $scope.kinds = topologyService.reduce_kinds(controller.items, controller.kinds, size_limit, controller.remove_hierarchy);
      }
    };

    controller.parseUrl = function(screenUrl) {
      if (screenUrl.match('show/?($|#)')) {
        return controller.dataUrl;
      }

      var match = screenUrl.match(/(ems_container|show)\/([0-9]+)\?display=topology($|#)/) ||
        screenUrl.match(/(_topology)\/show\/([0-9]+)\/?($|#)/);

      if (match) {
        var id = match[2];
        var url = controller.dataUrl;
        return url + (id && '/' + id);
      }
    };

    controller.refresh = function() {
      var url = controller.parseUrl($location.absUrl());

      $http.get(url)
        .then(controller.getTopologyData ? controller.getTopologyData : getTopologyData)
        .catch(miqService.handleFailure);
    };

    listenToRx(function(event) {
      if (event.name === 'refreshTopology') {
        controller.refresh();
      }
    });
  };

  this.mixinGetIcon = function(controller) {
    controller.getIcon = function(d) {
      switch (d.item.kind) {
        case 'CloudManager':
        case 'InfraManager':
        case 'PhysicalInfraManager':
        case 'ContainerManager':
        case 'NetworkManager':
          return controller.icons[d.item.display_kind];
        default:
          return controller.icons[d.item.kind];
      }
    };
  };

  this.mixinTopology = function(vm, $scope) {
    vm.d3 = $window.d3;
    miqHideSearchClearButton();
    vm.checkboxModel = {
      value: false,
    };
    vm.legendTooltip = __('Click here to show/hide entities of this type');
    $('input#box_display_names').click(this.showHideNames(vm));

    this.mixinContextMenu(vm);
    this.mixinRefresh(vm, $scope);
    this.mixinGetIcon(vm);
    vm.refresh();

    var promise = $interval(vm.refresh, 1000 * 60 * 3);
    $scope.$on('$destroy', function() {
      $interval.cancel(promise);
    });
    this.mixinSearch(vm);
  };
}]);
