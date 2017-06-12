ManageIQ.angular.app.component('genericButtonComponent', {
  bindings: {
    // id: '=?',
    // parent: '=?',
  },
  controllerAs: 'vm',
  controller: genericButtonController,
  templateUrl: '/static/buttons/generic_button_component.html.haml',
});

genericButtonController.$inject = ['miqService'];

/** @ngInject */
function genericButtonController(miqService) {
  var vm = this;

  vm.$onInit = function() {
    vm.saveable = miqService.saveable;
    vm.angularForm = miqService.angularForm;

    vm.resetClicked = function(angularForm) {
      vm.tenantModel = angular.copy(vm.modelCopy );
      angularForm.$setUntouched(true);
      angularForm.$setPristine(true);
      miqService.miqFlash("warn", __("All changes have been reset"));
    };

    vm.cancelClicked = function(angularForm) {
      tenantEditButtonClicked('cancel');
      angularForm.$setPristine(true);
    };

    vm.saveClicked = function(angularForm) {
      tenantEditButtonClicked('save', true);
      angularForm.$setPristine(true);
    };

    vm.addClicked = function(angularForm) {
      vm.saveClicked(angularForm);
    };
  };
}
