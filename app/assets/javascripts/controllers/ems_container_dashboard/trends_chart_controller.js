/* global miqHttpInject */
angular.module( 'patternfly.card' ).controller('trendsChartController', ['$q', 'providerId', '$http', 'chartsMixin', 'miqService', function($q, providerId, $http, chartsMixin, miqService) {
//angular.module('trendChartController', ['patternfly.charts', 'patternfly.card', 'ui.bootstrap'] ).controller('trendChartController', ['$q', 'providerId', '$http', 'chartsMixin', 'miqService', function($q, providerId, $http, chartsMixin, miqService) {
  var vm = this;
  vm.id = "trendsChart_" + providerId;
  var init = function() {
    ManageIQ.angular.scope = vm;
    vm.config = {
      chartId      : 'exampleTrendsChart',
      title        : 'Network Utilization Trends',
      layout       : 'large',
      trendLabel   : 'Virtual Disk I/O',
      valueType    : 'actual',
      timeFrame    : 'Last 15 Minutes',
      units        : 'MHz',
      tooltipType  : 'percentage',
      compactLabelPosition  : 'left'
    };
    vm.footerConfig = {
      iconClass : 'fa fa-plus-circle',
      text      : 'Add New Cluster',
      callBackFn: function () {
        alert("Footer Callback Fn Called");
      }
    };
    vm.filterConfig = {
      filters : [{label:'Last 30 Days', value:'30'},
        {label:'Last 15 Days', value:'15'},
        {label:'Today', value:'today'}],
      callBackFn: function (f) {
        alert("Filter Callback Fn Called for '" + f.label + "' value = " + f.value);
      }
    };
    vm.layouts = [
      {
        title: "Large",
        value: "large"
      },
      {
        title: "Small",
        value: "small"
      },
      {
        title: "Compact",
        value: "compact"
      },
      {
        title: "Inline",
        value: "inline"
      }
    ];
    vm.layout = vm.layouts[0];
    vm.updateLayout = function(item) {
      vm.layout = item;
      vm.config.layout = item.value;
    };
    vm.valueTypes = [
      {
        title: "Actual",
        value: "actual"
      },
      {
        title: "Percentage",
        value: "percentage"
      }
    ];
    vm.valueType = vm.valueTypes[0];
    vm.updateValueType = function(item) {
      vm.valueType = item;
      vm.config.valueType = item.value;
    };
//     var today = new Date();
//     var dates = ['dates'];
//     for (var d = 20 - 1; d >= 0; d--) {
//       dates.push(new Date(today.getTime() - (d * 24 * 60 * 60 * 1000)));
//     }
//     vm.data = {
//       dataAvailable: true,
//       total: 250,
//       xData: dates,
//       yData: ['used', 10, 20, 30, 20, 30, 10, 14, 20, 25, 68, 54, 56, 78, 56, 67, 88, 76, 65, 87, 76]
//     };

    var url = '/container_dashboard/network_metrics_data/' + providerId;
    var dataPromise = $http.get(url)
      .then(function(response) {
        vm.data = response.data.data;
      })
      .catch(miqService.handleFailure);

    $q.all([dataPromise]).then(function() {
      var data = vm.data.network_metrics;
      if (data.interval_name === 'daily') {
        vm.networkUtilizationConfig = chartsMixin.chartConfig.dailyNetworkUsageConfig;
      } else if (data.interval_name === 'hourly') {
        vm.networkUtilizationConfig = chartsMixin.chartConfig.hourlyNetworkUsageConfig;
      } else {
        vm.networkUtilizationConfig = chartsMixin.chartConfig.hourlyNetworkUsageConfig;
        vm.networkUtilizationConfig.timeFrame = __('Last 10 minutes');
      }

      if (data.xy_data != null) {
        data.xy_data.xData = data.xy_data.xData.map(function(date) {
          return chartsMixin.parseDate(date);
        });
      }

      vm.data = chartsMixin.processData(data.xy_data, 'dates', __("Network"));
    });

    vm.custShowXAxis = false;
    vm.custShowYAxis = false;
    vm.addDataPoint = function () {
      vm.data.xData.push(new Date(vm.data.xData[vm.data.xData.length - 1].getTime() + (24 * 60 * 60 * 1000)));
      vm.data.yData.push(Math.round(Math.random() * 100));
    };
  };

  init();
}]);
