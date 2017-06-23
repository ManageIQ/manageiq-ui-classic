ManageIQ.angular.app.component('formButtonComponent', {
  bindings: {
    angularForm: '=',
    modelCopy: '=',
    model: '=',
    redirectUrl: '=?',
    newRecord: '<',
    entity: '=?',
    entityName: '=?',
    saveClicked: '&?',
    addClicked: '&?',
    resetClicked: '&?',
    cancelClicked: '&?',
  },
  controllerAs: 'vm',
  controller: formButtonController,
  templateUrl: '/static/form/form_button_component.html.haml',
});

formButtonController.$inject = ['miqService'];

function formButtonController(miqService) {
  var vm = this;

  vm.$onInit = function() {
    vm.saveable = miqService.saveable;

    if (! angular.isDefined(vm.resetClicked)) {
      vm.resetClicked = function() {
        vm.model = angular.copy(vm.modelCopy);
        vm.angularForm.$setUntouched(true);
        vm.angularForm.$setPristine(true);
        miqService.miqFlash('warn', __('All changes have been reset'));
      };
    }

    if (! angular.isDefined(vm.cancelClicked)) {
      vm.cancelClicked = function() {
        miqService.sparkleOn();
        if (vm.newRecord) {
          miqService.redirectBack(sprintf(__('Creation of new %s was canceled by the user.'), vm.entity), 'warning', vm.redirectUrl);
        } else {
          miqService.redirectBack(sprintf(__('Edit of %s \"%s\" was canceled by the user.'), vm.entity, vm.entityName), 'warning', vm.redirectUrl);
        }
      };
    }
  };
}
