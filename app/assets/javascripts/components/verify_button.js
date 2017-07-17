ManageIQ.angular.app.component('verifyButton', {
  bindings: {
    validate: '&',
    enabled: '<',
  },
  controllerAs: 'vm',
  controller: ['$scope', function($scope) {
    $scope.__ = __;
    var vm = this;
  }],
  templateUrl: '/static/verify_button.html.haml'
});
