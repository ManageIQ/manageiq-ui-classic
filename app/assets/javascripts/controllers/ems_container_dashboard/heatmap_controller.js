/* global miqHttpInject */

angular.module( 'patternfly.charts' ).controller('heatmapContainerController', ['$q', 'providerId', '$http', 'miqService', function($q, providerId, $http, miqService) {
  var vm = this;
  vm.id = 'heatmap_' + providerId;
  vm.data = {};

  var init = function() {
    ManageIQ.angular.scope = vm;
    vm.timeframeLabel = __('Last 30 Days');
    vm.loadingDone = false;
    var url = '/container_dashboard/heatmaps_data/' + providerId;
    var heatmapPromise = $http.get(url)
      .then(function(response) {
        vm.heatmapData = response.data.data;
      })
      .catch(miqService.handleFailure);

    $q.all([heatmapPromise]).then(function() {
      vm.title = vm.heatmapData.heatmaps.title;
      vm.data = processHeatmapData(vm.data, vm.heatmapData.heatmaps);
      vm.loadingDone = true;
    });

    vm.dataAvailable = true;
    vm.titleAlt = __('Utilization - Overriding Defaults');
    vm.legendLabels = ['< 60%', '70%', '70-80%', '80-90%', '> 90%'];
    vm.rangeTooltips = [__('Memory Utilization < 70%<br\>40 Nodes'), __('Memory Utilization 70-80%<br\>4 Nodes'), __('Memory Utilization 80-90%<br\>4 Nodes'), __('Memory Utilization > 90%<br\>4 Nodes')];
    vm.thresholds = [0.6, 0.7, 0.8, 0.9];
    vm.heatmapColorPattern = ['#d4f0fa', '#F9D67A', '#EC7A08', '#CE0000', '#f00'];
    vm.showLegends = true;
  };

  var heatmapTitles = {
    'nodeCpuUsage': __('CPU'),
    'nodeMemoryUsage': __('Memory'),
  };

  var processHeatmapData = function(heatmapsStruct, data) {
    heatmapsStruct.data = {};
    var heatmapsStructData = [];

    if (data) {
      var keys = Object.keys(data);

      var heatmapData = function(d) {
        var percent = -1;
        var tooltip = __('Cluster: ') + d.node + '<br>' + __('Provider: ') + d.provider;
        if (d.percent === null || d.total === null) {
          tooltip += '<br> ' + __('Usage: Unknown');
        } else {
          percent = d.percent;
          tooltip += '<br>' + __('Usage: ') + sprintf(__('%d%% in use of %d %s total'), (percent * 100).toFixed(0),
            d.total, d.unit);
        }
        return {
          'id': keys[i] + '_' + d.id,
          'tooltip': tooltip,
          'value': percent,
        };
      };

      for (var i in keys) {
        if (keys[i] === 'title') { continue; }
        if (data[keys[i]] === null) {
          heatmapsStruct.data[heatmapTitles[keys[i]]] = [];
          vm.dataAvailable = false;
        } else {
          heatmapsStructData = data[keys[i]].map(heatmapData);
        }
        heatmapsStruct.data[heatmapTitles[keys[i]]] = _.sortBy(heatmapsStructData, 'value').reverse();
      }
    } else {
      heatmapsStruct.data = [];
      vm.dataAvailable = false;
    }
    return heatmapsStruct.data;
  };

  init();
}]);
