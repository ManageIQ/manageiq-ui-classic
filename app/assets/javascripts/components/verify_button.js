ManageIQ.angular.app.component('verifyButton', {
  bindings: {
    validate: '<',
    enabled: '<',
    validateUrl: '<',
    restful: '<',
    valtype: '<',
  },
  controllerAs: 'vm',
  controller: ['$scope', function($scope) {
    $scope.__ = __;
    var vm = this;
    vm.chooseValidation = function() {
      if (vm.restful) {
        vm.validate({target: '.validate_button:visible'}, vm.valtype, true);
        console.log('validate restful');
      } else {
        vm.validate(vm.validateUrl);
      }
    };
  }],
  templateUrl: '/static/verify_button.html.haml',
});
