ManageIQ.angular.app.directive('minTimeCheck', function() {
  return {
    require: 'ngModel',
    link: function(scope, _elem, attrs, ctrl) {
      scope.$watch(attrs.ngModel, function() {
        if (ctrl.viewValue !== undefined) {
          setSomePeriodCheckedValidity(ctrl, attrs);
        }
      });
      ctrl.$parsers.push(function(value) {
        setSomePeriodCheckedValidity(ctrl, attrs);
        return value;
      });

      var setSomePeriodCheckedValidity = function(ctrl, attrs) {
        if (attrs.timeType === 'day') {
          if (allDaysUnchecked(attrs.minTimeCheck)) {
            scope.vm.timeProfileModel.some_days_checked = false;
          } else {
            scope.vm.timeProfileModel.some_days_checked = true;
            scope.vm.timeProfileModel.all_days = false;
          }
        } else if (attrs.timeType === 'hour') {
          if (allHoursUnchecked(attrs.minTimeCheck)) {
            scope.vm.timeProfileModel.some_hours_checked = false;
          } else {
            scope.vm.timeProfileModel.some_hours_checked = true;
            scope.vm.timeProfileModel.all_hours = false;
          }
        }
      };

      var allDaysUnchecked = function(i) {
        var dayValues = _.times(7, _.constant(false));
        dayValues[i] = true;
        return angular.equals(scope.vm.timeProfileModel.dayValues, dayValues);
      };

      var allHoursUnchecked = function(i) {
        return allFirstHalfAMHoursUnchecked(i) ||
               allSecondHalfAMHoursUnchecked(i) ||
               allFirstHalfPMHoursUnchecked(i) ||
               allSecondHalfPMHoursUnchecked(i);
      };

      var allFirstHalfAMHoursUnchecked = function(i) {
        var hourFirstHalfAMValues = _.times(6, _.constant(false));
        hourFirstHalfAMValues[i] = true;
        return angular.equals(scope.vm.timeProfileModel.hourValuesAMFirstHalf, hourFirstHalfAMValues);
      };

      var allSecondHalfAMHoursUnchecked = function(i) {
        var hourSecondHalfAMValues = _.times(6, _.constant(false));
        hourSecondHalfAMValues[i] = true;
        return angular.equals(scope.vm.timeProfileModel.hourValuesAMSecondHalf, hourSecondHalfAMValues);
      };

      var allFirstHalfPMHoursUnchecked = function(i) {
        var hourFirstHalfPMValues = _.times(6, _.constant(false));
        hourFirstHalfPMValues[i] = true;
        return angular.equals(scope.vm.timeProfileModel.hourValuesPMFirstHalf, hourFirstHalfPMValues);
      };

      var allSecondHalfPMHoursUnchecked = function(i) {
        var hourSecondHalfPMValues = _.times(6, _.constant(false));
        hourSecondHalfPMValues[i] = true;
        return angular.equals(scope.vm.timeProfileModel.hourValuesPMSecondHalf, hourSecondHalfPMValues);
      };
    },
  };
});
