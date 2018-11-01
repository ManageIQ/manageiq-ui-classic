ManageIQ.angular.app.directive('resetValidationStatus', ['$rootScope', function($rootScope) {
  return {
    require: 'ngModel',
    link: function(scope, elem, attrs, ctrl) {
      scope.$watch(attrs.ngModel, function() {
        adjustValidationStatus(ctrl.$modelValue, _.get(getScopeOrController(scope), attrs.mainScope) || getScopeOrController(scope), ctrl, attrs, $rootScope);
      });

      ctrl.$parsers.push(function(value) {
        adjustValidationStatus(value, _.get(getScopeOrController(scope), attrs.mainScope) || getScopeOrController(scope), ctrl, attrs, $rootScope);
        return value;
      });
    },
  };
}]);

function getScopeOrController(scope) {
  return scope.controllerName ? scope[scope.controllerName] : scope;
}

var adjustValidationStatus = function(value, scope, ctrl, attrs, rootScope) {
  if (scope.checkAuthentication === true &&
     scope.postValidationModel !== undefined &&
     scope.postValidationModel[attrs.prefix] !== undefined) {
    var modelPostValidationObject = angular.copy(scope.postValidationModel[attrs.prefix]);
    delete modelPostValidationObject[ctrl.$name];

    var modelObject = angular.copy(scope[scope.model]);
    if (modelObject[ctrl.$name] !== undefined) {
      delete modelObject[ctrl.$name];
    }

    if (scope[scope.model][attrs.resetValidationDependsOn] === '' ||
      (value === '' && ! attrs.required) ||
        (value === scope.postValidationModel[attrs.prefix][ctrl.$name] && _.isMatch(modelObject, modelPostValidationObject))) {
      scope[scope.model][attrs.resetValidationStatus] = true;
      rootScope.$broadcast('clearErrorOnTab', {tab: attrs.prefix});
    } else {
      scope[scope.model][attrs.resetValidationStatus] = false;
      rootScope.$broadcast('setErrorOnTab', {tab: attrs.prefix});
    }

    if (scope[scope.model][attrs.resetValidationDependsOn] === '') {
      scope.postValidationModelRegistry(attrs.prefix);
    }
  }
};
