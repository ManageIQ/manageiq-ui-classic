ManageIQ.angular.app.directive('verifypasswd', function() {
  return {
    require: 'ngModel',
    link: function (scope, _elem, attr, ctrl) {
      var model = function() {
        if (scope.$parent.angularForm) {
          return scope.$parent.$eval(scope.$parent.angularForm.model || scope.$parent.model);
        } else {
          return scope.$eval(scope.angularForm.model || scope.model);
        }
      };

      var vmScope = function() {
        if (scope.$parent.angularForm) {
          return scope.$parent;
        } else {
          return scope;
        }
      };

      var log_password = attr.prefix + "_password";
      var log_verify = attr.prefix + "_verify";
      var logVerifyCtrl = attr.prefix + "_VerifyCtrl";

      scope.$watch(attr.ngModel, function() {
        if((ctrl.$modelValue != undefined && vmScope().afterGet) || vmScope().formId == "new") {
          if(ctrl.$name == log_verify) {
            scope[logVerifyCtrl] = ctrl;

            setValidity(vmScope(), ctrl, ctrl.$viewValue, model()[log_password]);
          }else if(ctrl.$name == log_password && scope[logVerifyCtrl] != undefined) {
            setValidity(vmScope(), scope[logVerifyCtrl], ctrl.$viewValue, model()[log_verify]);
          }
        }
      });

      ctrl.$parsers.push(function(value) {
        if (ctrl.$name == log_verify) {
          setValidity(vmScope(), ctrl, ctrl.$viewValue, model()[log_password]);
        }else if(ctrl.$name == log_password && scope[logVerifyCtrl] != undefined) {
          setValidity(vmScope(), scope[logVerifyCtrl], ctrl.$viewValue, model()[log_verify]);
        }
        return value;
      });

      var setValidity = function(_scope, logVerifyCtrl, valueNew, valueOrig) {
        if (valueNew == valueOrig) {
          logVerifyCtrl.$setValidity("verifypasswd", true);
        } else if (logVerifyCtrl.$dirty || valueOrig != "") {
          logVerifyCtrl.$setValidity("verifypasswd", false);
        }
      };
    }
  }
});

