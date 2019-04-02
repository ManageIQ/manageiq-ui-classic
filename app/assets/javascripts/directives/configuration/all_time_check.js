ManageIQ.angular.app.directive('allTimeCheck', function() {
  return {
    require: 'ngModel',
    link: function(scope, _elem, attrs, ctrl) {
      ctrl.$parsers.push(function(value) {
        if (attrs.timeType === 'day' && value) {
          setAllDaysChecked(attrs.allTimeCheck, value);
        } else if (attrs.timeType === 'hour' && value) {
          setAllHoursChecked(attrs.name, attrs.allTimeCheck, value);
        }
        return value;
      });

      var setAllDaysChecked = function(i, value) {
        var dayValues = scope.vm.timeProfileModel.dayValues;
        dayValues[i] = value;
        if (angular.equals(_.times(7, _.constant(true)), dayValues)) {
          scope.vm.timeProfileModel.all_days = true;
        }
      };

      var setAllHoursChecked = function(name, i, value) {
        var hoursArr = ['hourValuesAMFirstHalf',
          'hourValuesAMSecondHalf',
          'hourValuesPMFirstHalf',
          'hourValuesPMSecondHalf'];
        var updatedHourArr;
        var otherHourArrs = true;
        for (var j = 0; j < hoursArr.length; j++) {
          if (hoursArr[j] === name) {
            updatedHourArr = allQuarterArrHoursChecked(name, i, value);
          } else if (!angular.equals(_.times(6, _.constant(true)), scope.vm.timeProfileModel[hoursArr[j]])) {
            otherHourArrs = false;
            break;
          }
        }
        if (updatedHourArr && otherHourArrs) {
          scope.vm.timeProfileModel.all_hours = true;
        }
      };

      var allQuarterArrHoursChecked = function(name, i, value) {
        var quarterArrHours = scope.vm.timeProfileModel[name];
        quarterArrHours[i] = value;
        return angular.equals(_.times(6, _.constant(true)), quarterArrHours);
      };
    },
  };
});
