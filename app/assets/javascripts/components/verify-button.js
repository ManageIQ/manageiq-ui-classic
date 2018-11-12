ManageIQ.angular.app.component('verifyButton', {
  bindings: {
    validate: '<',
    enabled: '<',
    validateUrl: '@',
    restful: '<',
    valtype: '<',
    buttonLabels: '<',
  },
  controllerAs: 'vm',
  controller: ['$scope', function($scope) {
    $scope.__ = __;
    var vm = this;

    vm.findScope = function() {
      var parentScope = $scope;
      while (!parentScope.angularForm) {
        parentScope = parentScope.$parent;
      }
      return parentScope.angularForm;
    };

    vm.chooseValidation = function() {
      if (vm.restful) {
        vm.validate(
          {target: '.validate_button:visible'},
          vm.valtype,
          true,
          vm.findScope,
          vm.validateUrl
        );
      } else {
        vm.validate(vm.validateUrl);
      }
    };
  }],
  templateUrl: '/static/verify-button.html.haml',
});
