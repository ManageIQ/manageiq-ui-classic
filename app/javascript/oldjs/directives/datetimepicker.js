/*
 * The datetimepicker directive takes care of data conversion (String <-> Date)
 * between datetimepicker input and model. For the data conversion to work
 * correctly, the directive requires a date/time format to be supplied in
 * datetime-format attribute:
 *
 * <input type="text" datetimepicker="true" datetime-format="MM/DD/YYYY HH:mm" ... />
 *
 * Optionally, it's possible to set the following attributes via the directive:
 *
 * - datetime-locale: locale to use
 * - start-date: starting date for the datetime picker
 */

ManageIQ.angular.app.directive('datetimepicker', function() {
  return {
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl) {
      elem.datetimepicker({showClear: true, showClose: true});

      // datetime picker uses its own event for change
      elem.on('dp.change', function(event) {
        elem.trigger('change', event);
      });

      elem.on('dp.error', function(event) {
        if (elem.val() === '') {
          elem.trigger('change', event);
        }
      });

      // date & time format
      if (attr.datetimeFormat) {
        elem.data('DateTimePicker').format(attr.datetimeFormat);
      }

      // date & time locale
      if (attr.datetimeLocale) {
        elem.data('DateTimePicker').locale(attr.datetimeLocale);
      }

      // start date
      if (attr.startDate) {
        scope.$watch(attr.startDate, function(value) {
          elem.data('DateTimePicker').minDate(value);
        });
      }

      // formatter
      ctrl.$formatters.push(function(value) {
        if (value) {
          return moment(value).format(attr.datetimeFormat);
        }
      });

      // parser
      ctrl.$parsers.push(function(value) {
        if (value) {
          return moment(value, attr.datetimeFormat).toDate();
        }

        return null;
      });
    },
  };
});
