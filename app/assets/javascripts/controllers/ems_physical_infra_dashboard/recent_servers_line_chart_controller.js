/* global miqHttpInject */
angular.module( 'patternfly.charts' ).component('recentServersLineChart', {
  bindings: {
    providerId: '@?',
  },
  templateUrl: '/static/ems_physical_infra/recent-servers-line-chart.html.haml',
  controller: ['$http', 'chartsMixin', 'miqService', function($http, chartsMixin, miqService) {
    var vm = this;
    vm.id = 'recentServersLineChartData';
    vm.$onInit = function() {
      vm.loadingDone = false;
      vm.config = chartsMixin.chartConfig.recentServersConfig;
      vm.timeframeLabel = __('Last 30 Days');
      var url = '/ems_physical_infra_dashboard/recent_servers_data/';
      if (vm.providerId) {
        url += vm.providerId;
      }

      $http.get(url)
        .then(function(response) {
          vm.data = response.data.data;

          if (vm.data.recentServers.dataAvailable === false) {
            vm.data.dataAvailable = false;
          } else {
            vm.data = chartsMixin.processData(vm.data.recentServers, 'dates', vm.data.recentServers.config.label);
          }
          Object.assign(vm.config, vm.data);
          vm.loadingDone = true;
        })
        .catch(miqService.handleFailure);

      vm.custShowXAxis = false;
      vm.custShowYAxis = false;
      vm.custAreaChart = true;
    };
  }],
});
