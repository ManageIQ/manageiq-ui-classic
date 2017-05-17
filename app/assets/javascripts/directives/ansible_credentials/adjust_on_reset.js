ManageIQ.angular.app.directive('adjustOnReset', function() {
  return {
    link: function(scope, _elem, attr) {
      scope.$watch('vm.reset', function() {
        scope.vm.cancelPassword(attr.adjustOnReset);
      });
    },
  };
});
