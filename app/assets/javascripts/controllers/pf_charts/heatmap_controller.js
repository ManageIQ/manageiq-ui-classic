/* global miqHttpInject */

angular.module( 'patternfly.charts' ).controller('heatmapController', ['$scope', '$q', 'providerId','API', '$http', 'miqService', function($scope, $q, providerId, API, $http, miqService) {
  var vm = this;
  vm.data = {};

  var init = function() {
    ManageIQ.angular.scope = vm;

    ///////////////////////////////////////
    // Comment/remove block below to use http call
    ///////////////////////////////////////
    data = {
      'clusterCpuUsage': [{"id":10000000000002,"node":"Default","provider":"RHV","unit":"Cores","total":48,"percent":0.35},
         {"id":10000000000003,"node":"Default","provider":"RHV","unit":"Cores","total":98,"percent":0.95}],
      'clusterMemoryUsage': [{"id":10000000000002,"node":"Default","provider":"RHV","unit":"GB","total":753,"percent":0.53},
         {"id":10000000000003,"node":"Default","provider":"RHV","unit":"GB","total":2753,"percent":0.93}]
    };
    vm.title = 'Cluster Utilization';
    vm.data = processHeatmapData(vm.data, data)

    ///////////////////////////////////////
    // Comment/remove block above to use http call
    ///////////////////////////////////////

    ////////////
    //// use block below to use http call to set data
    ////////////
//     var url = '/ems_infra_dashboard/data/' + providerId;
//     var heatmapPromise = $http.get(url).then(function(response) {
//       vm.heatmapData = response.data.data;
//     })
//
//     $q.all([heatmapPromise]).then(function() {
//       vm.data = processHeatmapData(vm.data, vm.heatmapData.heatmaps)
//       vm.title = vm.heatmapData.heatmaps.title;
//     });
    ////////////
    //// use block above to use http call to set data
    ////////////

    vm.dataAvailable = true;
    vm.titleAlt = 'Utilization - Overriding Defaults';
    vm.legendLabels = ['< 60%','70%', '70-80%' ,'80-90%', '> 90%'];
    vm.rangeTooltips = ['Memory Utilization < 70%<br\>40 Nodes', 'Memory Utilization 70-80%<br\>4 Nodes', 'Memory Utilization 80-90%<br\>4 Nodes', 'Memory Utilization > 90%<br\>4 Nodes'];
    vm.thresholds = [0.6, 0.7, 0.8, 0.9];
    vm.heatmapColorPattern = ['#d4f0fa', '#F9D67A', '#EC7A08', '#CE0000', '#f00'];
    vm.showLegends = true;

    var clickAction = function (block) {
      console.log(block);
    };
    vm.clickAction = clickAction;
  };

  var heatmapTitles = {
    "clusterCpuUsage": "CPU",
    "clusterMemoryUsage": "Memory"
  }

  var processHeatmapData = function(heatmapsStruct, data) {
    heatmapsStruct.data = {};
    if (data) {
      var keys = Object.keys(data);
      for (i in keys) {
        if (keys[i] == 'title') { continue; }
        var heatmapsStructData = data[keys[i]].map(function (d) {
          var percent = -1;
          var tooltip = __("Cluster: ") + d.node + "<br>" + __("Provider: ") + d.provider
          if (d.percent === null || d.total === null) {
            tooltip += "<br> " + __("Usage: Unknown");
          }
          else {
            percent = d.percent
            tooltip += "<br>" + __("Usage: ") + sprintf(__("%d%% in use of %d %s total"), (percent * 100).toFixed(0),
                d.total, d.unit);
          }
          return {
            "id": d.id,
            "tooltip": tooltip,
            "value": percent
          };
        })
        heatmapsStruct.data[heatmapTitles[keys[i]]] = _.sortBy(heatmapsStructData, 'value').reverse()
      }
    }
    else
      {
        heatmapsStruct.data = [];
        heatmapsStruct.dataAvailable = false
      }
    return heatmapsStruct.data
  };

  init();
}]);
