ManageIQ.angular.app.directive('validationStatus', ['$rootScope', function($rootScope) {
  return {
    require: 'ngModel',
    link: function(scope, elem, attrs, ctrl) {
      ctrl.$validators.validationRequired = function(modelValue, viewValue) {
        if (viewValue !== undefined && viewValue === true) {
          if (! scope.postValidationModelRegistry) {
            /**
            * awfull hack to fix the emsCommonFormController to work with angular authCredentials component
            * TODO break the emsCommonFormController into multiple controllers/components and fix this directive
            */
            scope.$parent.$parent.$parent.postValidationModelRegistry(attrs.prefix);
          } else {
            scope.postValidationModelRegistry(attrs.prefix);
          }
          return true;
        }
        $rootScope.$broadcast('setErrorOnTab', {tab: attrs.prefix});
        return false;
      };
    },
  };
}]);
