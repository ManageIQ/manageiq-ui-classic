/* global miqHttpInject */
angular.module( 'patternfly.charts' ).controller( 'recentVmsLineChartController', ['$scope', 'pfUtils', '$q', 'providerId', '$http', 'chartsMixin', function( $scope, pfUtils, $q, providerId, $http, chartsMixin ) {
  var vm = this;

  var init = function() {
    ManageIQ.angular.scope = vm;
    vm.config = chartsMixin.chartConfig['recentVmsConfig'];
    var url = '/ems_infra_dashboard/recent_vms_data/' + providerId;
    var vmsDataPromise = $http.get(url).then(function(response) {
      vm.data = response.data.data;
    });

    $q.all([vmsDataPromise]).then(function() {
      if (vm.data.recentVms.dataAvailable === false)
        vm.data.dataAvailable = false;
      else
        vm.data = chartsMixin.processData(vm.data.recentVms, 'dates', vm.data.recentVms.config.label)
    });

    vm.custShowXAxis = false;
    vm.custShowYAxis = false;
    vm.custAreaChart = true;
  }

  init();
}]);
