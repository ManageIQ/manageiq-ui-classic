angular.module( 'patternfly.charts' ).controller('utilizationTrendChartController', ['$scope', '$q', 'providerId', 'chartsMixin', '$http', function($scope, $q, providerId, chartsMixin, $http) {
  var vm = this;

  var init = function() {
    ManageIQ.angular.scope = vm;
    vm.data = {};

    var url = '/ems_infra_dashboard/ems_utilization_data/' + providerId;
    var metricsPromise = $http.get(url).then(function(response) {
      vm.metricsData = response.data.data;
    })

    $q.all([metricsPromise]).then(function() {
      vm.data = processMetricsData(vm.data, vm.metricsData.ems_utilization)
    });

    vm.title = "Global Utilization";

//     vm.config = {
//       title: 'Memory',
//       units: 'GB'
//     };
//     vm.donutConfig = {
//       chartId: 'chartA',
//       thresholds: {'warning': '60', 'error': '90'}
//     };
//     vm.sparklineConfig = {
//       'chartId': 'exampleSparkline',
//       'tooltipType': 'default',
//       'units': 'GB'
//     };

//     var today = new Date();
//     var dates = ['dates'];
//     for (var d = 20 - 1; d >= 0; d--) {
//       dates.push(new Date(today.getTime() - (d * 24 * 60 * 60 * 1000)));
//     }
//     vm.data = {
//       dataAvailable: true,
//       used: 76,
//       total: 100,
//       xData: dates,
//       yData: ['used', '10', '20', '30', '20', '30', '10', '14', '20', '25', '68', '54', '56', '78', '56', '67', '88',
//               '76', '65', '87', '76']
//     };

    vm.centerLabel = 'used';
    vm.custShowXAxis = false;
    vm.custShowYAxis = false;
    vm.custChartHeight = 60;
    vm.dataAvailable = false;

    vm.addDataPoint = function () {
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
      for (i in keys) {
        if (data[keys[i]] === null) {
          var metricsDataStructData = [];
          metricsDataStruct.data[keys[i]] = {
            'data': {dataAvailable: false},
            'config': {
              'title': chartsMixin.chartConfig[keys[i] + 'UsageConfig'].title
            }
          };
        } else {
          metricsDataStruct.data[keys[i]] = {
            'data': processData(data[keys[i]], 'dates', chartsMixin.chartConfig[keys[i] + 'UsageConfig'].units),
            'config': {
              'title': chartsMixin.chartConfig[keys[i] + 'UsageConfig'].title,
              'units': chartsMixin.chartConfig[keys[i] + 'UsageConfig'].units
            },
            'donutConfig': chartsMixin.chartConfig[keys[i] + 'UsageDonutConfig'],
            'sparklineConfig': chartsMixin.chartConfig[keys[i] + 'UsageSparklineConfig']
          }
        }
      }
    } else {
      metricsDataStruct.data = {dataAvailable: false};
    }
    return metricsDataStruct.data
  };

  var processData = function(data, xDataLabel, yDataLabel) {
    if (!data) {
      return { data: {dataAvailable: false} }
    }

    data.xData.unshift(xDataLabel);
    data.yData.unshift(yDataLabel);
    return data;
  };

  init();
}]);
