/* global miqHttpInject */
angular.module( 'patternfly.charts' ).controller( 'recentPodsLineChartController', ['$q', 'providerId', '$http', 'chartsMixin', 'miqService', function($q, providerId, $http, chartsMixin, miqService) {
  var vm = this;
  vm.id = 'recentPodsLineChart_' + providerId;
  vm.lineChartId = vm.id;
  var init = function() {
    ManageIQ.angular.scope = vm;
    vm.loadingDone = false;
    vm.timeframeLabel = __('Last 30 Days');
    var url = '/container_dashboard/pod_metrics_data/' + providerId;
    var podsDataPromise = $http.get(url)
      .then(function(response) {
        vm.data = response.data.data;
      })
      .catch(miqService.handleFailure);

    $q.all([podsDataPromise]).then(function() {
      if (vm.data.pod_metrics.dataAvailable === false) {
        vm.data.dataAvailable = false;
      } else {
        // Pod metrics
        if (vm.data.pod_metrics.interval_name === 'daily') {
          vm.config = chartsMixin.chartConfig.dailyPodUsageConfig;
        } else {
          vm.config = chartsMixin.chartConfig.hourlyPodUsageConfig;
        }

        if (vm.data.pod_metrics.xy_data != null) {
          vm.data.pod_metrics.xy_data.xData = vm.data.pod_metrics.xy_data.xData.map(function(date) {
            return chartsMixin.parseDate(date);
          });
        }
        vm.data = chartsMixin.processPodUtilizationData(vm.data.pod_metrics.xy_data, 'dates', __('Created'), __('Deleted'));
      }
      vm.loadingDone = true;
    });

    vm.custShowXAxis = false;
    vm.custShowYAxis = false;
    vm.custAreaChart = true;
  };

  init();
}]);
