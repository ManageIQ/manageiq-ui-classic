/* global miqHttpInject */

angular.module( 'patternfly.card' ).controller('aggregateStatusCardController', ['$scope', '$http', 'miqService', function($scope, $http, miqService) {
  var vm = this;

  var init = function() {
    var url = '/' + $scope.providerType + '_dashboard/aggregate_status_data/' + $scope.providerId;
    $http.get(url)
      .then(function(response) {
        var aggStatusData = response.data.data.aggStatus;

        vm.status = aggStatusData.status;
        vm.AggStatus = aggStatusData.attrData;
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
    templateUrl: function(elem, attr) {
      return '/static/ems_common/aggregate-status-card.html.haml';
    },
  };
});
