/* global miqHttpInject */
angular.module( 'patternfly.card' ).controller('trendsChartController', ['$q', 'providerId', '$http', 'chartsMixin', 'miqService', function($q, providerId, $http, chartsMixin, miqService) {
  var vm = this;
  vm.id = 'trendsChart_' + providerId;
  var init = function() {
    ManageIQ.angular.scope = vm;
    vm.loadingDone = false;
    var url = '/container_dashboard/network_metrics_data/' + providerId;
    var dataPromise = $http.get(url)
      .then(function(response) {
        vm.data = response.data.data;
      })
      .catch(miqService.handleFailure);

    $q.all([dataPromise]).then(function() {
      var data = vm.data.network_metrics;

      if (data.interval_name === 'daily') {
        vm.config = chartsMixin.chartConfig.dailyNetworkUsageConfig;
      } else if (data.interval_name === 'hourly') {
        vm.config = chartsMixin.chartConfig.hourlyNetworkUsageConfig;
      } else {
        vm.config = chartsMixin.chartConfig.hourlyNetworkUsageConfig;
        vm.config.timeFrame = __('Last 10 minutes');
      }

      if (data.dataAvailable === false) {
        vm.data.dataAvailable = false;
      } else {
        if (data.xy_data != null) {
          data.xy_data.xData = data.xy_data.xData.map(function(date) {
            return chartsMixin.parseDate(date);
          });
        }
        vm.data = chartsMixin.processData(data.xy_data, 'dates', __('Network'));
      }
      vm.loadingDone = true;
    });

    vm.custShowXAxis = false;
    vm.custShowYAxis = false;
  };

  init();
}]);
