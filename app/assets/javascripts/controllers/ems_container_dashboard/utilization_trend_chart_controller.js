angular.module( 'patternfly.charts' ).controller('utilizationTrendChartContainerController', ['$q', 'providerId', 'chartsMixin', '$http', 'miqService', '$scope', function($q, providerId, chartsMixin, $http, miqService, $scope) {
  var vm = this;

  var init = function() {
    ManageIQ.angular.form = $scope.angularForm;
    vm.data = {};
    vm.loadingDone = false;

    var url = '/container_dashboard/ems_utilization_data/' + providerId;
    var metricsPromise = $http.get(url)
      .then(function(response) {
        vm.metricsData = response.data.data;
      })
      .catch(miqService.handleFailure);

    $q.all([metricsPromise]).then(function() {
      vm.data = processMetricsData(vm.data, vm.metricsData.ems_utilization);
      vm.loadingDone = true;
    });

    vm.title = __('Aggregated Node Utilization');
    vm.centerLabel = 'used';
    vm.custShowXAxis = false;
    vm.custShowYAxis = false;
    vm.custChartHeight = 60;
    vm.dataAvailable = false;

    vm.addDataPoint = function() {
      var newData = Math.round(Math.random() * 100);
      var newDate = new Date(vm.data.xData[vm.data.xData.length - 1].getTime() + (24 * 60 * 60 * 1000));
      vm.data.used = newData;
      vm.data.xData.push(newDate);
      vm.data.yData.push(newData);
    };
  };

  var processMetricsData = function(metricsDataStruct, allData) {
    var data = allData.xy_data;

    if (allData.interval_name === 'hourly') {
      vm.timeframeLabel = __('Last 24 hours');
    } else if (allData.interval_name === 'realtime') {
      vm.timeframeLabel = __('Last 10 minutes');
    } else {
      vm.timeframeLabel = __('Last 30 Days');
    }

    if (allData.xy_data.cpu != null) {
      allData.xy_data.cpu.xData = allData.xy_data.cpu.xData.map(function(date) {
        return chartsMixin.parseDate(date);
      });
      allData.xy_data.memory.xData = allData.xy_data.memory.xData.map(function(date) {
        return chartsMixin.parseDate(date);
      });
    }

    metricsDataStruct.data = {};
    if (data) {
      var keys = Object.keys(data);
      for (var i in keys) {
        var key = keys[i];  // 'cpu' || 'memory'
        if (data[key] === null) {
          metricsDataStruct.data[key] = {
            'data': {dataAvailable: false},
            'config': {
              'title': chartsMixin.chartConfig[key + 'UsageConfig'].title,
            },
          };
        } else {
          var sparkline = Object.assign({}, chartsMixin.chartConfig[key + 'UsageSparklineConfig']);
          if (allData.interval_name !== 'daily') { // hourly or realtime
            sparkline.tooltipFn = chartsMixin.hourlyTimeTooltip;
          }

          metricsDataStruct.data[key] = {
            'data': chartsMixin.processData(data[key], 'dates', chartsMixin.chartConfig[key + 'UsageConfig'].units),
            'id': key + 'UsageConfig_' + providerId,
            'config': {
              'title': chartsMixin.chartConfig[key + 'UsageConfig'].title,
              'units': chartsMixin.chartConfig[key + 'UsageConfig'].units,
            },
            'donutConfig': chartsMixin.chartConfig[key + 'UsageDonutConfig'],
            'sparklineConfig': sparkline,
          };
        }
      }
    } else {
      metricsDataStruct.data = {dataAvailable: false};
    }
    return metricsDataStruct.data;
  };

  init();
}]);
