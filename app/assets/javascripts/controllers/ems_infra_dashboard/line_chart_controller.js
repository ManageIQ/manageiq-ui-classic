/* global miqHttpInject */
angular.module( 'patternfly.charts' ).controller( 'lineChartController', ['$scope', 'pfUtils', '$q', 'providerId', '$http', 'chartsMixin', 'objectType', function( $scope, pfUtils, $q, providerId, $http, chartsMixin, objectType ) {
  var vm = this;

  var init = function() {
    alert(objectType)
    ManageIQ.angular.scope = vm;
    vm.config = chartsMixin.chartConfig['recent' + objectType + 'Config'];
    var url = '/ems_infra_dashboard/recent_objects_data/' + providerId + '?object_type=' + objectType;
    var dataPromise = $http.get(url).then(function(response) {
      vm.data = response.data.data;
    });

    $q.all([dataPromise]).then(function() {
      vm.data = chartsMixin.processData(vm.data.recentData, 'dates', vm.data.recentData.config.label)
    });

    vm.custShowXAxis = false;
    vm.custShowYAxis = false;
    vm.custAreaChart = true;
  }

  init();
}]);
