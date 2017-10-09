/* global miqHttpInject */
angular.module( 'patternfly.charts' ).controller( 'recentHostsLineChartController', ['$q', 'providerId', '$http', 'chartsMixin', 'miqService', function($q, providerId, $http, chartsMixin, miqService) {
  var vm = this;
  vm.id = "recentHostsLineChart_" + providerId;
  var init = function() {
    ManageIQ.angular.scope = vm;
    vm.config = chartsMixin.chartConfig.recentHostsConfig;
    var url = '/ems_infra_dashboard/recent_hosts_data/' + providerId;
    var hostsDataPromise = $http.get(url)
      .then(function(response) {
        vm.data = response.data.data;
      })
      .catch(miqService.handleFailure);

    $q.all([hostsDataPromise]).then(function() {
      if (vm.data.recentHosts.dataAvailable === false) {
        vm.data.dataAvailable = false;
      } else {
        vm.data = chartsMixin.processData(vm.data.recentHosts, 'dates', vm.data.recentHosts.config.label);
      }
    });

    vm.custShowXAxis = false;
    vm.custShowYAxis = false;
    vm.custAreaChart = true;
  };

  init();
}]);
