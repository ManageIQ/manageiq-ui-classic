ManageIQ.angular.app.component('authCredentials', {
  bindings: {
    newRecord: '<',
    modelCopy: '<',
    model: '<',
    prefix: '@',
    userRequired: '<',
    /**
    * setuserId should be in diagnostic databse form controller
    */
    setUserId: '&'
  },
  controllerAs: 'vm',
  controller: ['$scope', function($scope) {
    $scope.__ = __;

    var vm = this;

    this.$onInit = function() {
      this.bChangeStoredPassword = this.newRecord;
      this.bCancelPasswordChange = this.newRecord;
      console.log(vm.model);
    };

    this.changeStoredPassword = function() {
      vm.bChangeStoredPassword = true;
      vm.bCancelPasswordChange = false;
    };
    this.cancelPasswordChange = function() {
      if (vm.bChangeStoredPassword) {
        vm.bCancelPasswordChange = true;
        vm.bChangeStoredPassword = false;
      }
    };

    this.showChangePasswordLinks = function(index) {
      return ! vm.newRecord && vm.modelCopy[index] !== '';
    };

    this.showVerify = function(userid) {
      return vm.newRecord || (! vm.showChangePasswordLinks(userid)) || vm.bChangeStoredPassword;
    };
    $scope.$on('resetClicked', function(_e) {
      vm.cancelPasswordChange();
    });
  }],
  templateUrl: '/static/auth_credentials.html.haml',

});
