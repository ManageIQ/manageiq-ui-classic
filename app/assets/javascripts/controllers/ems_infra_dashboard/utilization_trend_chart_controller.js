angular.module( 'patternfly.charts' ).controller('utilizationTrendChartController', ['$q', 'providerId', 'chartsMixin', '$http', 'miqService', function($q, providerId, chartsMixin, $http, miqService) {
  var vm = this;

  var init = function() {
    ManageIQ.angular.scope = vm;
    vm.data = {};
    vm.loadingDone = false;

    var url = '/ems_infra_dashboard/ems_utilization_data/' + providerId;
    var metricsPromise = $http.get(url)
      .then(function(response) {
        vm.metricsData = response.data.data;
      })
      .catch(miqService.handleFailure);

    $q.all([metricsPromise]).then(function() {
      vm.data = processMetricsData(vm.data, vm.metricsData.ems_utilization);
      vm.loadingDone = true;
    });

    vm.title = __('Global Utilization');
    vm.centerLabel = 'used';
    vm.custShowXAxis = false;
    vm.custShowYAxis = false;
    vm.custChartHeight = 60;
    vm.dataAvailable = false;
    vm.timeframeLabel = __('Last 30 Days');

    vm.addDataPoint = function() {
      var newData = Math.round(Math.random() * 100);
      var newDate = new Date(vm.data.xData[vm.data.xData.length - 1].getTime() + (24 * 60 * 60 * 1000));
      vm.data.used = newData;
      vm.data.xData.push(newDate);
      vm.data.yData.push(newData);
    };
  };

  var processMetricsData = function(metricsDataStruct, data) {
    metricsDataStruct.data = {};
    if (data) {
      var keys = Object.keys(data);
      for (var i in keys) {
        if (data[keys[i]] === null) {
          metricsDataStruct.data[keys[i]] = {
            'data': {dataAvailable: false},
            'config': {
              'title': chartsMixin.chartConfig[keys[i] + 'UsageConfig'].title,
            },
          };
        } else {
          metricsDataStruct.data[keys[i]] = {
            'data': chartsMixin.processData(data[keys[i]], 'dates', chartsMixin.chartConfig[keys[i] + 'UsageConfig'].units),
            'id': keys[i] + 'UsageConfig_' + providerId,
            'config': {
              'title': chartsMixin.chartConfig[keys[i] + 'UsageConfig'].title,
              'units': chartsMixin.chartConfig[keys[i] + 'UsageConfig'].units,
            },
            'donutConfig': chartsMixin.chartConfig[keys[i] + 'UsageDonutConfig'],
            'sparklineConfig': chartsMixin.chartConfig[keys[i] + 'UsageSparklineConfig'],
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
