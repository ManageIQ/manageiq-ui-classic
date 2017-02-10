ManageIQ.angular.app.directive('checkchange', ['miqService', function(miqService) {
  return {
    require: 'ngModel',
    link: function (scope, elem, attr, ctrl) {
      scope['formchange_' + ctrl.$name] = elem[0].name
      scope['elemType_' + ctrl.$name] = attr.type;

      var angularForm = function() {
        if (scope.$parent.vm && scope.$parent.vm.angularForm) {
          return scope.$parent.vm.angularForm;
        } else if (scope.vm && scope.vm.angularForm) {
          return scope.vm.angularForm;
        } else if (scope.$parent.$parent && scope.$parent.$parent.angularForm) {
          return scope.$parent.$parent.angularForm;
        } else {
          return scope.angularForm;
        }
      };

      var modelCopy = function() {
        if (scope.$parent.vm && scope.$parent.vm.modelCopy) {
          return scope.$parent.vm.modelCopy;
        } else if (scope.vm && scope.vm.modelCopy) {
          return scope.vm.modelCopy;
        } else if (scope.$parent.$parent && scope.$parent.$parent.modelCopy) {
          return scope.$parent.$parent.modelCopy;
        } else {
          return scope.modelCopy;
        }
      };

      var model = function() {
        if (scope.$parent.vm && scope.$parent.vm.model) {
          return scope.$parent.vm[scope.$parent.vm.model];
        } else if (scope.vm && scope.vm.model) {
          return scope.vm[scope.vm.model];
        } else if (scope.$parent.$parent && scope.$parent.$parent.model) {
          return scope.$parent.$parent[scope.$parent.$parent.model];
        } else {
          return scope[scope.model];
        }
      };

      if (angular.isDefined(modelCopy())) {
        scope.$watch(attr.ngModel, function () {
          if (scope['elemType_' + ctrl.$name] == "date" || _.isDate(ctrl.$modelValue)) {
            viewModelDateComparison(scope, ctrl, modelCopy(), angularForm());
          } else {
            viewModelComparison(scope, ctrl, modelCopy(), model(), angularForm());
          }
          if (angularForm().$pristine)
            checkForOverallFormPristinity(scope, ctrl, modelCopy(), model(), angularForm());
        });
      }

      ctrl.$parsers.push(function(value) {
        miqService.miqFlashClear();

        if (value == modelCopy()[ctrl.$name]) {
          angularForm()[scope['formchange_' + ctrl.$name]].$setPristine();
        }
        if (angularForm()[scope['formchange_' + ctrl.$name]].$pristine) {
          checkForOverallFormPristinity(scope, ctrl, modelCopy(), model(), angularForm());
        }
        angularForm()[scope['formchange_' + ctrl.$name]].$setTouched();
        return value;
      });

      if(angularForm().$pristine)
        angularForm().$setPristine();
    }
  }
}]);

var viewModelComparison = function(scope, ctrl, modelCopy, model, angularForm) {
  if ((Array.isArray(modelCopy[ctrl.$name]) &&
       angular.equals(model[ctrl.$name], modelCopy[ctrl.$name])) ||
       ctrl.$viewValue == modelCopy[ctrl.$name]) {
    angularForm[scope['formchange_' + ctrl.$name]].$setPristine();
    angularForm[scope['formchange_' + ctrl.$name]].$setUntouched();
    angularForm.$pristine = true;
  } else {
    angularForm[scope['formchange_' + ctrl.$name]].$setDirty();
    angularForm.$pristine = false;
  }
};

var viewModelDateComparison = function(scope, ctrl, modelCopy, angularForm) {
  var modelDate = (ctrl.$modelValue != undefined) ? moment(ctrl.$modelValue) : null;
  var copyDate = (modelCopy[ctrl.$name] != undefined) ? moment(modelCopy[ctrl.$name]) : null;

  if((modelDate && copyDate && (modelDate.diff(copyDate, 'days') == 0)) || (!modelDate && !copyDate)){
    angularForm[scope['formchange_' + ctrl.$name]].$setPristine();
    angularForm[scope['formchange_' + ctrl.$name]].$setUntouched();
    angularForm.$pristine = true;
  } else {
    angularForm[scope['formchange_' + ctrl.$name]].$setDirty();
    angularForm.$pristine = false;
  }
};

var checkForOverallFormPristinity = function(scope, ctrl, modelCopy, model, angularForm) {
  // don't do anything before the model and modelCopy are actually initialized
  if (! modelCopy || ! model)
    return;

  var modelCopyObject = _.cloneDeep(modelCopy);
  delete modelCopyObject[ctrl.$name];

  var modelObject = _.cloneDeep(model);
  delete modelObject[ctrl.$name];

  angularForm.$pristine = angular.equals(modelCopyObject, modelObject);

  if (angularForm.$pristine)
    angularForm.$setPristine();
};
