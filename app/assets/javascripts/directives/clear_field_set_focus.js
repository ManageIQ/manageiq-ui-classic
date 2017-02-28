ManageIQ.angular.app.directive('clearFieldSetFocus', ['$timeout', 'miqService', function($timeout, miqService) {
  return {
    require: 'ngModel',
    link: function (scope, elem, attr, ctrl) {
      scope['form_passwordfocus_' + ctrl.$name] = elem[0];

      var option = attr.clearFieldSetFocus;

      scope.$watch('vm.bChangeStoredPassword', function(value) {
        if (value) {
          $timeout(function () {
            if (scope.$parent.vm) {
              scope.$parent.vm[scope.$parent.vm.model][ctrl.$name] = '';
            } else {
              scope[scope.model][ctrl.$name] = '';
            }
            if(option != "no-focus")
              angular.element(scope['form_passwordfocus_' + ctrl.$name]).focus();
          }, 0);
        }
      });

      scope.$watch('vm.bCancelPasswordChange', function(value) {
        if (value) {
          $timeout(function () {
            if (scope.$parent.vm) {
              scope.$parent.vm[scope.$parent.vm.model][ctrl.$name] = miqService.storedPasswordPlaceholder;
            } else {
              scope[scope.model][ctrl.$name] = miqService.storedPasswordPlaceholder;
            }
          }, 0);
        }
      });
    }
  }
}]);
