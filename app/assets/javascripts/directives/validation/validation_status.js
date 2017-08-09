ManageIQ.angular.app.directive('validationStatus', ['$rootScope', function($rootScope) {
  return {
    require: 'ngModel',
    link: function (scope, elem, attrs, ctrl) {
      ctrl.$validators.validationRequired = function (modelValue, viewValue) {
        if (viewValue !== undefined && viewValue === true) {
          _.get(scope, attrs.mainScope).postValidationModelRegistry(attrs.prefix);
          return true;
        } else {
          $rootScope.$broadcast('setErrorOnTab', {tab: attrs.prefix});
          return false;
        }
      };
    }
  }
}]);
