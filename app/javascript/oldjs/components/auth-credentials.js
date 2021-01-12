ManageIQ.angular.app.component('authCredentials', {
  bindings: {
    modelCopy: '<',
    formModel: '<',
    enableValidButton: '<',
    validate: '<',
    prefix: '@',
    formLabels: '<?',
    userRequired: '<?',
    userPrivileged: '<?',
    passwordRequired: '<?',
    hideUser: '<?',
    hidePassword: '<?',
    newRecord: '<?',
    postValidationModelRegistry: '<?',
    postValidationModel: '<?',
    checkAuthentication: '<?',
  },
  controllerAs: 'vm',
  controller: ['$scope', function($scope) {
    $scope.__ = __;
    $scope.controllerName = 'vm';

    var vm = this;
    vm.model = 'formModel';

    this.$onInit = function() {
      this.bChangeStoredPassword = false;
      this.bCancelPasswordChange = this.newRecord;
      this.buildInputsLabels();
    };

    this.buildInputsLabels = function() {
      vm.userIdLabel = vm.formLabels && vm.formLabels.userIdLabel || __('Username');
      vm.passwordLabel = vm.formLabels && vm.formLabels.passwordLabel || __('Password');
      vm.newPasswordLabel = vm.formLabels && vm.formLabels.verifyLabel || __('New password');
      vm.changeStoredPasswordLabel = vm.formLabels && vm.formLabels.changeStoredPassword || __('Change stored password');
      vm.cancelPasswordChangeLabel = vm.formLabels && vm.formLabels.cancelPasswordChange || __('Cancel password change');

      vm.buttonLabels = {
        verifyTitleOnLabel: vm.formLabels && vm.formLabels.verifyTitleOnLabel
                         || __('Validate the credentials by logging into the Server'),
        verifyTitleOffLabel: vm.formLabels && vm.formLabels.verifyTitleOffLabel
                           || __('Server information, Username and matching password fields are needed to perform verification of credentials'),
      };
    };

    this.changeStoredPassword = function() {
      vm.bChangeStoredPassword = true;
      vm.formModel[vm.prefix + '_password'] = '';
      vm.bCancelPasswordChange = false;
    };
    this.cancelPasswordChange = function() {
      if (vm.bChangeStoredPassword) {
        vm.bCancelPasswordChange = true;
        var tmp = {};
        tmp[vm.prefix  + '_password'] = vm.modelCopy[vm.prefix + '_password'];
        Object.assign(vm.formModel, tmp);
        vm.bChangeStoredPassword = false;
      }
    };

    this.showChangePasswordLinks = function(index) {
      var matchPassword = vm.modelCopy[vm.prefix + '_password'] === vm.formModel[vm.prefix + '_password'];
      return vm.bChangeStoredPassword ||
        !vm.newRecord && (vm.modelCopy[vm.prefix + '_protocol'] === vm.formModel[vm.prefix + '_protocol'] && matchPassword) && vm.formModel[index];
    };

    this.showVerify = function(userid) {
      return vm.newRecord || (!vm.showChangePasswordLinks(userid)) || vm.bChangeStoredPassword;
    };
    $scope.$on('resetClicked', function(_e) {
      vm.cancelPasswordChange();
    });
  }],
  templateUrl: '/static/auth-credentials.html.haml',
});
