angular.module( 'patternfly.card' ).controller('aggregateStatusCardController', ['$scope', '$http', 'miqService', function($scope, $http, miqService) {
  var vm = this;

  var init = function() {
    var url = '/' + $scope.providerType + '_dashboard/aggregate_status_data/';
    if ($scope.providerId) {
      url += $scope.providerId;
    }
    $http.get(url)
      .then(function(response) {
        var aggStatusData = response.data.data.aggStatus;

        vm.status = aggStatusData.status;
        vm.AggStatus = aggStatusData.attrData;
        vm.showTopBorder = aggStatusData.showTopBorder;
        vm.aggregateLayout = aggStatusData.aggregateLayout;
        vm.aggregateClass = aggStatusData.aggregateClass;
      })
      .catch(miqService.handleFailure);
  };

  init();
}]).directive('aggregateStatusCard', function() {
  return {
    restrict: 'E',
    scope: {
      providerId: '@',
      providerType: '@',
    },
    templateUrl: function() {
      return '/static/ems_common/aggregate-status-card.html.haml';
    },
  };
});
