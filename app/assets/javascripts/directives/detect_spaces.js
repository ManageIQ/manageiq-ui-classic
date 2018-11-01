ManageIQ.angular.app.directive('detectSpaces', function() {
  return {
    require: 'ngModel',
    link: function(_scope, _elem, _attrs, ctrl) {
      ctrl.$validators.detectedSpaces = function(modelValue, viewValue) {
        if (viewValue === undefined || (viewValue !== undefined && ! detectedSpaces(viewValue))) {
          return true;
        }
        return false;
      };

      var detectedSpaces = function(s) {
        return /\s/g.test(s);
      };
    },
  };
});
