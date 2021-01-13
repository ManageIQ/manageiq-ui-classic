angular.module('patternfly.charts' ).component( 'serverHealthPieChart', {
  bindings: {
    providerId: '@?',
  },
  templateUrl: '/static/ems_physical_infra/group-chart.html.haml',
  controller: 'serverHealthPieChartController',
}).controller('serverHealthPieChartController',  ['$http', 'chartsMixin', 'miqService', function($http, chartsMixin, miqService) {
  'use strict';
  var vm = this;
  vm.id = 'serverHealthPieChartData';

  var init = function() {
    vm.data = {};
    vm.loadingDone = false;
    var url = '/ems_physical_infra_dashboard/servers_group_data/';
    if (vm.providerId) {
      url += vm.providerId;
    }

    $http.get(url)
      .then(function(response) {
        vm.metricsData = response.data.data;
        vm.data = processMetricsData(vm.data, vm.metricsData.serversGroup);
        vm.loadingDone = true;
      })
      .catch(miqService.handleFailure);

    vm.title = __('Servers Data');
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
            'id': keys[i] + 'UsageConfigData',
            'config': {
              'title': chartsMixin.chartConfig[keys[i] + 'UsageConfig'].title,
              'units': chartsMixin.chartConfig[keys[i] + 'UsageConfig'].units,
            },
            'pieConfig': chartsMixin.chartConfig[keys[i] + 'UsagePieConfig'],
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
