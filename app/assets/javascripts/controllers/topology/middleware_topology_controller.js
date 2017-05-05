angular.module('ManageIQ').controller('middlewareTopologyController', MiddlewareTopologyCtrl);
MiddlewareTopologyCtrl.$inject = ['$scope', '$http', '$interval', '$location', 'topologyService', 'miqService'];

function MiddlewareTopologyCtrl($scope, $http, $interval, $location, topologyService, miqService) {
  ManageIQ.angular.scope = $scope;
  miqHideSearchClearButton();
  var self = this;
  $scope.vs = null;
  var d3 = window.d3;
  $scope.d3 = d3;
  var icons;

  $scope.refresh = function() {
    var id;
    if ($location.absUrl().match('show/$') || $location.absUrl().match('show$')) {
      id = '';
    } else {
      id = '/' + (/middleware_topology\/show\/(\d+)/.exec($location.absUrl())[1]);
    }
    var url = '/middleware_topology/data' + id;
    $http.get(url)
      .then(getMiddlewareTopologyData)
      .catch(miqService.handleFailure);
  };

  $scope.checkboxModel = {
    value: false,
  };
  $scope.legendTooltip = 'Click here to show/hide entities of this type';

  $scope.show_hide_names = function() {
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

  $('input#box_display_names').click($scope.show_hide_names);
  $scope.refresh();
  var promise = $interval($scope.refresh, 1000 * 60 * 3);

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
        return self.getCircleDimensions(d).r;
      })
      .attr('class', function(d) {
        return topologyService.getItemStatusClass(d);
      });
    added.append('title');
    added.on('dblclick', function(d) {
      return self.dblclick(d);
    });
    added.append('image')
      .attr('xlink:href', function(d) {
        var iconInfo = self.getIcon(d);
        return (iconInfo.type == 'glyph' ? '' : iconInfo.icon);
      })
      .attr('y', function(d) {
        return self.getCircleDimensions(d).y;
      })
      .attr('x', function(d) {
        return self.getCircleDimensions(d).x;
      })
      .attr('height', function(d) {
        return self.getCircleDimensions(d).height;
      })
      .attr('width', function(d) {
        return self.getCircleDimensions(d).width;
      });

    // attached labels
    added.append('text')
      .attr('x', 26)
      .attr('y', 24)
      .text(function(d) {
        return d.item.name;
      })
      .attr('class', 'attached-label' + ($scope.checkboxModel.value ? ' visible' : ''));

    // possible glyphs
    added.append('text')
      .each(function(d) {
        var iconInfo = self.getIcon(d);
        if (iconInfo.type != 'glyph') {
          return;
        }
        var fontFamily = 'font-family:' + iconInfo.fontfamily + ';';
        $(this).text(iconInfo.icon)
          .attr('class', 'glyph')
          .attr('style', fontFamily)
          .attr('x', 0)
          .attr('y', 8);

        // override some properties for container glyph, because it looks too small and alignment is wrong
        if (d.item.kind === 'Container') {
          $(this).text(iconInfo.icon)
            .attr('style', 'font-size: 20px;' + fontFamily)
            .attr('y', 7);
        }
      });

    added.selectAll('title').text(function(d) {
      return topologyService.tooltip(d).join('\n');
    });
    $scope.vs = vertices;

    /* Don't do default rendering */
    ev.preventDefault();
  });

  self.getIcon = function getIcon(d) {
    if (d.item.icon) {
      return {
        'type': 'image',
        'icon': d.item.icon,
      };
    }

    return icons[d.item.display_kind];
  };

  self.dblclick = function dblclick(d) {
    window.location.assign(topologyService.geturl(d));
  };

  self.getCircleDimensions = function getCircleDimensions(d) {
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

  $scope.searchNode = function() {
    var svg = topologyService.getSVG($scope.d3);
    var query = $('input#search_topology')[0].value;

    topologyService.searchNode(svg, query);
  };

  $scope.resetSearch = function() {
    topologyService.resetSearch($scope.d3);

    // Reset the search term in search input
    $('input#search_topology')[0].value = '';
  };

  function getMiddlewareTopologyData(response) {
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
}
