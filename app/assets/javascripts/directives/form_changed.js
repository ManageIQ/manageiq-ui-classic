ManageIQ.angular.app.directive('formChanged', function() {
  return {
    require: 'form',
    link: function(scope, _elem, _attr, ctrl) {
      var model = function() {
        return scope.$eval(ctrl.model || scope.model);
      };
      var modelCopy = function() {
        return scope.$eval(ctrl.modelCopy || 'modelCopy');
      };
      scope.$watchCollection(ctrl.model || scope.model, function() {
        if (angular.equals(model(), modelCopy())) {
          ctrl.$setPristine();
        }
      });
    },
  };
});

