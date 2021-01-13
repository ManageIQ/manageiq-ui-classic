(function() {
  ManageIQ.angular.app.component('changePassword', {
    bindings: {
      recordId: '@?',
      recordName: '@?',
      redirectUrl: '@',
    },
    controllerAs: 'vm',
    controller: changePasswordFormController,
    templateUrl: '/static/ems_physical_infra/change_password.html.haml',
  });

  changePasswordFormController.$inject = ['API', 'miqService'];

  function changePasswordFormController(API, miqService) {
    var vm = this;

    vm.$onInit = function() {
      vm.entity = 'Physical Provider';

      vm.model = modelInit();
      vm.modelCopy = angular.copy(vm.model);
    };

    vm.saveClicked = function() {
      var saveMsg = sprintf(__('Requested password change for the %s "%s".'), vm.entity, vm.recordName);
      vm.saveWithAPI('post', '/api/providers/' + vm.recordId, vm.model, saveMsg);
    };

    vm.saveWithAPI = function(method, url, saveObject, saveMsg) {
      miqService.sparkleOn();
      API[method](url, saveObject, {
        skipErrors: [400],  // server-side validation
      })
        .then(miqService.redirectBack.bind(vm, saveMsg, 'success', vm.redirectUrl))
        .catch(miqService.handleFailure);
    };

    vm.resetClicked = function() {
      vm.model = modelInit();
    };

    vm.cancelClicked = function() {
      miqService.sparkleOn();
      miqService.redirectBack(sprintf(__('Edit of %s "%s" was canceled by the user.'), vm.entity, vm.recordName), 'warning', vm.redirectUrl);
    };

    vm.current_and_new_password_are_equals = function() {
      return isFieldsEquals(vm.model.new_password, vm.model.current_password);
    };

    vm.confirmation_and_new_password_are_different = function() {
      if (vm.model.confirm_password) {
        return !isFieldsEquals(vm.model.confirm_password, vm.model.new_password);
      }
      return false;
    };

    vm.saveable = function() {
      return !!(vm.model.current_password
            && vm.model.new_password
            && vm.model.confirm_password
            && !vm.confirmation_and_new_password_are_different()
            && !vm.current_and_new_password_are_equals());
    };
  }

  /**
  * Compares two fields and see if they are equal.
  *  If some field is empty it doesn't compares and just return false.
  *
  * @param {*} firstField - First field to be compared
  * @param {*} secondField - Second field to be compared
  *
  * @return {Boolean} If one of the fields is empty, returns false
  *                   if the fields are equal, returns true
  *                   else return false.
  */
  function isFieldsEquals(firstField, secondField) {
    if (firstField && secondField) {
      return firstField === secondField;
    }
    return false;
  }

  function modelInit() {
    return {
      current_password: '',
      new_password: '',
      confirm_password: '',
      action: 'change_password',
    };
  }
})();
