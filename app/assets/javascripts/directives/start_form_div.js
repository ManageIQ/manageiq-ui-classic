ManageIQ.angular.app.directive('startFormDiv', ['$timeout', function($timeout) {
  return {
    link: function(scope, _elem, attr) {
      $timeout(function () {
        angular.element('#' + attr.startFormDiv).show();
      });
    },
  };
}]);
