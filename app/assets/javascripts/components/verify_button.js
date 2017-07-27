ManageIQ.angular.app.component('verifyButton', {
  bindings: {
    validate: '<',
    enabled: '<',
    validateUrl: '<',
    restfull: '<',
    valtype: '<',
    buttonLabels: '<',
  },
  controllerAs: 'vm',
  controller: ['$scope', function($scope) {
    $scope.__ = __;
    var vm = this;

    vm.chooseValidation = function() {
      if (vm.restfull) {
        vm.validate({target: '.validate_button:visible'}, vm.valtype, true);
      } else {
        vm.validate(vm.validateUrl);
      }
    };
  }],
  templateUrl: '/static/verify_button.html.haml',
});
