ManageIQ.angular.app.directive('urlValidation', function() {
  return {
    require: 'ngModel',
    link: function (_scope, _elem, _attrs, ctrl) {
      ctrl.$validators.urlValidation = function (modelValue, viewValue) {
        if (!viewValue) {
          return true;
        }
        return validUrl(viewValue);
      };

      var validUrl = function(s) {
        debugger;
        return s.substring(0, 8) === 'https://' || s.substring(0, 7) === 'http://';
      };
    }
  }
});
