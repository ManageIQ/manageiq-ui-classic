ManageIQ.angular.app.controller('buttonGroupController', ['$scope', 'miqService', function($scope, miqService) {
  var init = function() {
    $scope.saveable = miqService.saveable;
  };
  init();
}]);
