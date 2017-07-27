ManageIQ.angular.app.component('verifyButton', {
  bindings: {
    validate: '<',
    enabled: '<',
    validateUrl: '<',
    restful: '<',
    valtype: '<',
    verifyTitleOff: '@',
    verifyTitleOn: '@',
  },
  controllerAs: 'vm',
  controller: ['$scope', function($scope) {
    $scope.__ = __;
    var vm = this;

    this.$onInit = function() {
      if (! vm.verifyTitleOff) {
        vm.verifyTitleOff = 'test';
        console.log('test button');
      }
      if (! vm.verifyTitleOn) {
        vm.verifyTitleOn = 'test on';
      }
    };
    vm.chooseValidation = function() {
      if (vm.restful) {
        vm.validate({target: '.validate_button:visible'}, vm.valtype, true);
      } else {
        vm.validate(vm.validateUrl);
      }
    };
  }],
  templateUrl: '/static/verify_button.html.haml',
});
