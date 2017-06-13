ManageIQ.angular.app.component('genericButtonComponent', {
  bindings: {
    angularForm: '=',
    modelCopy: '=',
    model: '=',
    redirectUrl: '=?',
    newRecord: '<',
    entity: '@',
    entityName: '=?',
  },
  controllerAs: 'vm',
  controller: genericButtonController,
  templateUrl: '/static/buttons/generic_button_component.html.haml',
});

genericButtonController.$inject = ['miqService', '$window'];

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
      if (vm.newRecord) {
        miqService.redirectBack(sprintf(__("Creation of new %s was canceled by the user."), vm.entity), 'warning', vm.redirectUrl);
      } else {
        miqService.redirectBack(sprintf(__("Edit of %s \"%s\" was canceled by the user."), vm.entity, vm.entityName), 'warning', vm.redirectUrl);
      }
    };

    vm.saveClicked = function() {

    };

    vm.addClicked = function() {

    };
  };
}
