ManageIQ.angular.app.directive('verifypasswd', function() {
  return {
    require: 'ngModel',
    link: function (scope, _elem, attr, ctrl) {
      var log_password = attr.prefix + "_password";
      var log_verify = attr.prefix + "_verify";
      var logVerifyCtrl = attr.prefix + "_VerifyCtrl";

      var scopeModel;
      var scopeVm;
      if (angular.isDefined(scope.$parent.vm)) {
        scopeModel = scope.$parent.vm[scope.$parent.vm.model];
        scopeVm = scope.$parent.vm;
      } else {
        scopeModel = scope[scope.model];
        scopeVm = scope;
      }

      scope.$watch(attr.ngModel, function() {
        if((ctrl.$modelValue != undefined && scopeVm.afterGet) || scopeVm.formId == "new") {
          if(ctrl.$name == log_verify) {
            scopeVm[logVerifyCtrl] = ctrl;

            setValidity(scope, ctrl, ctrl.$viewValue, scopeModel[log_password]);
          }else if(ctrl.$name == log_password && scopeVm[logVerifyCtrl] != undefined) {
            setValidity(scope, scopeVm[logVerifyCtrl], ctrl.$viewValue, scopeModel[log_verify]);
          }
        }
      });

      ctrl.$parsers.push(function(value) {
        if (ctrl.$name == log_verify) {
          setValidity(scope, ctrl, ctrl.$viewValue, scopeModel[log_password]);
        }else if(ctrl.$name == log_password && scopeVm[logVerifyCtrl] != undefined) {
          setValidity(scope, scopeVm[logVerifyCtrl], ctrl.$viewValue, scopeModel[log_verify]);
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
