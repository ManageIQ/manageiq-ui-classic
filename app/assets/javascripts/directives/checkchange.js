ManageIQ.angular.app.directive('checkchange', ['miqService', function(miqService) {
  return {
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl) {
      scope['formchange_' + ctrl.$name] = elem[0].name;
      scope['elemType_' + ctrl.$name] = attr.type;

      var model = function() {
        if (scope.$parent.angularForm) {
          return scope.$parent.$eval(scope.$parent.angularForm.model || scope.$parent.model);
        }
        return scope.$eval(scope.angularForm.model || scope.model);
      };
      var modelCopy = function() {
        if (scope.$parent.angularForm) {
          return scope.$parent.$eval(scope.$parent.angularForm.modelCopy || 'modelCopy');
        }
        return scope.$eval(scope.angularForm.modelCopy || 'modelCopy');
      };

      if (modelCopy()) {
        scope.$watch(attr.ngModel, function() {
          if (scope['elemType_' + ctrl.$name] == 'date' || _.isDate(ctrl.$modelValue)) {
            viewModelDateComparison(scope, ctrl);
          } else {
            viewModelComparison(scope, ctrl);
          }
          if (scope.angularForm.$pristine) {checkForOverallFormPristinity(scope, ctrl);}
        });
      }

      ctrl.$parsers.push(function(value) {
        miqService.miqFlashClear();

        if (value == modelCopy()[ctrl.$name]) {
          scope.angularForm[scope['formchange_' + ctrl.$name]].$setPristine();
        }
        if (scope.angularForm[scope['formchange_' + ctrl.$name]].$pristine) {
          checkForOverallFormPristinity(scope, ctrl);
        }
        scope.angularForm[scope['formchange_' + ctrl.$name]].$setTouched();
        return value;
      });

      if (scope.angularForm.$pristine) {scope.angularForm.$setPristine();}

      var viewModelComparison = function(scope, ctrl) {
        if ((Array.isArray(modelCopy()[ctrl.$name]) &&
          angular.equals(model()[ctrl.$name], modelCopy()[ctrl.$name])) ||
          ctrl.$viewValue == modelCopy()[ctrl.$name]) {
          scope.angularForm[scope['formchange_' + ctrl.$name]].$setPristine();
          scope.angularForm[scope['formchange_' + ctrl.$name]].$setUntouched();
          scope.angularForm.$pristine = true;
        } else {
          scope.angularForm[scope['formchange_' + ctrl.$name]].$setDirty();
          scope.angularForm.$pristine = false;
        }
      };

      var viewModelDateComparison = function(scope, ctrl) {
        var modelDate = (ctrl.$modelValue != undefined) ? moment(ctrl.$modelValue) : null;
        var copyDate = (modelCopy()[ctrl.$name] != undefined) ? moment(modelCopy()[ctrl.$name]) : null;

        if ((modelDate && copyDate && (modelDate.diff(copyDate, 'days') == 0)) || (! modelDate && ! copyDate)) {
          scope.angularForm[scope['formchange_' + ctrl.$name]].$setPristine();
          scope.angularForm[scope['formchange_' + ctrl.$name]].$setUntouched();
          scope.angularForm.$pristine = true;
        } else {
          scope.angularForm[scope['formchange_' + ctrl.$name]].$setDirty();
          scope.angularForm.$pristine = false;
        }
      };

      var checkForOverallFormPristinity = function(scope, ctrl) {
        // don't do anything before the model and modelCopy are actually initialized
        if (! model() || ! modelCopy()) {return;}

        var modelCopyObject = _.cloneDeep(modelCopy());
        delete modelCopyObject[ctrl.$name];

        var modelObject = _.cloneDeep(model());
        delete modelObject[ctrl.$name];

        scope.angularForm.$pristine = angular.equals(modelCopyObject, modelObject);

        if (scope.angularForm.$pristine) {scope.angularForm.$setPristine();}
      };
    },
  };
}]);

