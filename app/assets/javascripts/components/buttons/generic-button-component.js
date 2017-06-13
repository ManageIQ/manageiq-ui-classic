ManageIQ.angular.app.component('genericButtonComponent', {
  bindings: {
    angularForm: '=',
    modelCopy: '=',
    model: '=',
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

    vm.resetClicked = function() {
      vm.model = angular.copy(vm.modelCopy );
      vm.angularForm.$setUntouched(true);
      vm.angularForm.$setPristine(true);
      miqService.miqFlash("warn", __("All changes have been reset"));
    };

    vm.cancelClicked = function() {

    };

    vm.saveClicked = function() {

    };

    vm.addClicked = function() {

    };
  };
}
