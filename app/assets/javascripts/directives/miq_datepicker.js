/*
 * The 'miq-datepicker' angular calendar directive takes care of:
 * 1. data conversion (String <-> Date) between datepicker input and model
 * 2. re-configuring datepicker (start date, end date, skip days), whenever
 *    the model changes.
 *
 * Supported attributes:
 * - miq-cal-date-from: starting date for the datepicker
 * - miq-cal-date-to: end date for the datepicker
 * - miq-cal-skip-days: days of the week (array) to disable in the datepicker
 */

ManageIQ.angular.app.directive('miqDatepicker', function() {
  return {
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl) {
      ctrl.$formatters.push(function(value) {
        if (value) {
          return moment(value).utc().format('MM/DD/YYYY');
        }
      });

      ctrl.$parsers.push(function(value) {
        if (value) {
          return moment(value, 'MM/DD/YYYY').utc().toDate();
        }
      });

      scope.$watch(attr.ngModel, function(value) {
        if (value) {
          elem.datepicker('update');
        }
      });

      if (elem.attr('data-provide') !== 'datepicker') {
        throw 'Needs data-provide attribute';
      }

      if (attr.miqCalDateFrom) {
        scope.$watch(attr.miqCalDateFrom, function(value) {
          elem.datepicker('setStartDate', value);
        });
      }

      if (attr.miqCalDateTo) {
        scope.$watch(attr.miqCalDateTo, function(value) {
          elem.datepicker('setEndDate', value);
        });
      }

      if (attr.miqCalSkipDays) {
        scope.$watch(attr.miqCalSkipDays, function(value) {
          elem.datepicker('setDaysOfWeekDisabled', value);
        });
      }
    },
  };
});
