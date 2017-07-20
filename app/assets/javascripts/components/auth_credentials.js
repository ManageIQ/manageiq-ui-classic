ManageIQ.angular.app.component('authCredentials', {
  bindings: {
    newRecord: '<',
    modelCopy: '<',
    model: '<',
    prefix: '@',
    userRequired: '<',
    hideUser: '<',
    passwordRequired: '<',
    enableValidButton: '<',
    validate: '<',
    validateUrl: '@',
    restful: '<',
    /**
    * is used in vrifyButton component for restfull validation, may be obsolete
    */
    valtype: '@',
    /**
    * emsCommonModel check for userid format username@realm
    */
    emsCommonModel: '<',
    /**
    * setuserId should be in diagnostic databse form controller
    */
    setUserId: '&',
  },
  controllerAs: 'vm',
  controller: ['$scope', function($scope) {
    $scope.__ = __;

    var vm = this;

    this.$onInit = function() {
      this.bChangeStoredPassword = this.newRecord;
      this.bCancelPasswordChange = this.newRecord;
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
