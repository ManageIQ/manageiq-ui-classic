/* global miqHttpInject */
angular.module( 'patternfly.charts' ).controller( 'recentHostsLineChartController', ['$scope', 'pfUtils', '$q', 'providerId', '$http', 'chartsMixin', function( $scope, pfUtils, $q, providerId, $http, chartsMixin ) {
  var vm = this;

  var init = function() {
    ManageIQ.angular.scope = vm;
    vm.config = chartsMixin.chartConfig['recentHostsConfig'];
    var url = '/ems_infra_dashboard/recent_hosts_data/' + providerId;
    var hostsDataPromise = $http.get(url).then(function(response) {
      vm.data = response.data.data;
    });

    $q.all([hostsDataPromise]).then(function() {
      vm.data = chartsMixin.processData(vm.data.recentHosts, 'dates', vm.data.recentHosts.config.label)
    });

    vm.custShowXAxis = false;
    vm.custShowYAxis = false;
    vm.custAreaChart = true;
  }

  init();
}]);
