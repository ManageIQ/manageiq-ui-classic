ManageIQ.angular.app.controller('buttonGroupController', ['$scope', 'miqService', function($scope, miqService) {
  const init = function() {
    $scope.saveable = miqService.saveable;
    $scope.reactFormDirty = false;
  };
  init();

  listenToRx(function(event) {
    if (event.name === 'dirty') {
      $scope.reactFormDirty = true;
      $scope.$apply();
    } else {
      $scope.reactFormDirty = false;
      $scope.$apply();
    }
  });

}]);
