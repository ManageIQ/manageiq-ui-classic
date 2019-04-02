ManageIQ.angular.app.directive('greaterOrZero', function() {
  return {
    require: 'ngModel',
    link: function(_scope, _elem, _attrs, ctrl) {
      ctrl.$validators.greaterOrZero = function(viewValue) {
        if (!viewValue) {
          return true;
        }
        return validInput(viewValue);
      };

      var validInput = function(s) {
        return parseFloat(s) >= 0;
      };
    },
  };
});
