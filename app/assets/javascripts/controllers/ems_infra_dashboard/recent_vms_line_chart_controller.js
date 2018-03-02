/* global miqHttpInject */
angular.module( 'patternfly.charts' ).controller( 'recentVmsLineChartController', ['$q', 'providerId', '$http', 'chartsMixin', 'miqService', function($q, providerId, $http, chartsMixin, miqService) {
  var vm = this;
  vm.id = "recentVmsLineChart_" + providerId;
  var init = function() {
    ManageIQ.angular.scope = vm;
    vm.loadingDone = false;
    vm.config = chartsMixin.chartConfig.recentVmsConfig;
    vm.timeframeLabel = __('Last 30 Days');
    var url = '/ems_infra_dashboard/recent_vms_data/' + providerId;
    var vmsDataPromise = $http.get(url)
      .then(function(response) {
        vm.data = response.data.data;
      })
      .catch(miqService.handleFailure);

    $q.all([vmsDataPromise]).then(function() {
      if (vm.data.recentVms.dataAvailable === false) {
        vm.data.dataAvailable = false;
      } else {
        vm.data = chartsMixin.processData(vm.data.recentVms, 'dates', vm.data.recentVms.config.label);
      }
      Object.assign(vm.config, vm.data);
      vm.loadingDone = true;
    });

    vm.custShowXAxis = false;
    vm.custShowYAxis = false;
    vm.custAreaChart = true;
  };

  init();
}]);
