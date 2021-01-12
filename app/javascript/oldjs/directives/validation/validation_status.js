ManageIQ.angular.app.directive('validationStatus', ['$rootScope', function($rootScope) {
  return {
    require: 'ngModel',
    scope: {
      postValidationModelRegistry: '<?',
      prefix: '@?',
    },
    link: function(scope, _elem, _attrs, ctrl) {
      ctrl.$validators.validationRequired = function(_modelValue, viewValue) {
        if (viewValue) {
          scope.postValidationModelRegistry(scope.prefix);
          return true;
        }
        $rootScope.$broadcast('setErrorOnTab', {tab: scope.prefix});
        return false;
      };
    },
  };
}]);
