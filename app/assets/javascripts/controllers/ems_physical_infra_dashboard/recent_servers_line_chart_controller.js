/* global miqHttpInject */
angular.module( 'patternfly.charts' ).controller( 'recentServersLineChartController', ['$q', 'providerId', '$http', 'chartsMixin', 'miqService', function($q, providerId, $http, chartsMixin, miqService) {
  var vm = this;
  vm.id = "recentServersLineChart_" + providerId;
  var init = function() {
    ManageIQ.angular.scope = vm;
    vm.loadingDone = false;
    vm.config = chartsMixin.chartConfig.recentServersConfig;
    vm.timeframeLabel = __('Last 30 Days');
    var url = '/ems_physical_infra_dashboard/recent_servers_data/' + providerId;
    var serversDataPromise = $http.get(url)
      .then(function(response) {
        vm.data = response.data.data;
      })
      .catch(miqService.handleFailure);

    $q.all([serversDataPromise]).then(function() {
      if (vm.data.recentServers.dataAvailable === false) {
        vm.data.dataAvailable = false;
      } else {
        vm.data = chartsMixin.processData(vm.data.recentServers, 'dates', vm.data.recentServers.config.label);
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
