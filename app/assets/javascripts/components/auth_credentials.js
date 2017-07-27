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
    restfull: '<',
    verifyTitleOff: '@',
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
    checkAuthentication: '<',
    formLabels: '<',
  },
  controllerAs: 'vm',
  controller: ['$scope', function($scope) {
    $scope.__ = __;

    var vm = this;

    this.$onInit = function() {
      this.bChangeStoredPassword = this.newRecord;
      this.bCancelPasswordChange = this.newRecord;
      // build inputs labels
      vm.userIdLabel = vm.formLabels && vm.formLabels.userIdLabel || __('Username');
      vm.passwordLabel = vm.formLabels && vm.formLabels.passwordLabel || __('Password');
      vm.changeStoredPasswordLabel = vm.formLabels && vm.formLabels.changeStoredPassword || __('Change stored password');
      vm.cancelPasswordChangeLabel = vm.formLabels && vm.formLabels.cancelPasswordChange || __('Cancel password change');

      vm.buttonLabels = {
        verifyTitleOn: vm.formLabels && vm.formLabels.verifyTitleOn
                        || __('Validate the credentials by logging into the Server'),
        verifyTitleOff: vm.formLabels && vm.formLabels.verifyTitleOff
                          || __('Server information, Username and matching password fields are needed to perform verification of credentials'),
      };
    };

    this.changeStoredPassword = function() {
      vm.bChangeStoredPassword = true;
      vm.model[vm.prefix + '_password'] = '';
      vm.bCancelPasswordChange = false;
    };
    this.cancelPasswordChange = function() {
      if (vm.bChangeStoredPassword) {
        vm.bCancelPasswordChange = true;
        Object.assign(vm.model, {
          [vm.prefix + '_password']: vm.modelCopy[vm.prefix + '_password'],
        });
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
