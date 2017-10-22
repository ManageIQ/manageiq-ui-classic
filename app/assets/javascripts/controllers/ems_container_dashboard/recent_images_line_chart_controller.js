/* global miqHttpInject */
angular.module( 'patternfly.charts' ).controller( 'recentImagesLineChartController', ['$q', 'providerId', '$http', 'chartsMixin', 'miqService', function($q, providerId, $http, chartsMixin, miqService) {
  var vm = this;
  vm.id = "recentImagesLineChart_" + providerId;
  var init = function() {
    ManageIQ.angular.scope = vm;
    vm.loadingDone = false;
    vm.config = chartsMixin.chartConfig.recentHostsConfig;
    vm.timeframeLabel = __('Last 30 Days');
    var url = '/container_dashboard/image_metrics_data/' + providerId;
    var imagesDataPromise = $http.get(url)
      .then(function(response) {
        vm.data = response.data.data;
      })
      .catch(miqService.handleFailure);

    $q.all([imagesDataPromise]).then(function() {
      if (vm.data.image_metrics.dataAvailable === false) {
        vm.data.dataAvailable = false;
      } else {
        vm.data = chartsMixin.processData(vm.data.image_metrics.xy_data, 'dates', __("Images"));
      }
      vm.loadingDone = true;
    });

    vm.custShowXAxis = false;
    vm.custShowYAxis = false;
    vm.custAreaChart = true;
  };

  init();
}]);
