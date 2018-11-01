ManageIQ.angular.app.directive('clearFieldSetFocus', ['$timeout', 'miqService', function($timeout, miqService) {
  return {
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl) {
      var model = function() {
        if (scope.$parent.angularForm) {
          return scope.$parent.$eval(scope.$parent.angularForm.model || scope.$parent.model);
        }
        return scope.$eval(scope.angularForm.model || scope.model);
      };
      scope['form_passwordfocus_' + ctrl.$name] = elem[0];

      var option = attr.clearFieldSetFocus;

      scope.$watch('vm.bChangeStoredPassword', function(value) {
        if (value) {
          $timeout(function() {
            model()[ctrl.$name] = '';
            if (option !== 'no-focus') {angular.element(scope['form_passwordfocus_' + ctrl.$name]).focus();}
          }, 0);
        }
      });

      scope.$watch('vm.bCancelPasswordChange', function(value) {
        if (value) {
          $timeout(function() {
            model()[ctrl.$name] = miqService.storedPasswordPlaceholder;
          }, 0);
        }
      });
    },
  };
}]);
