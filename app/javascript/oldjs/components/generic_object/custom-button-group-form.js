ManageIQ.angular.app.component('customButtonGroupForm', {
  bindings: {
    angularForm: '<',
    model: '=',
  },
  controllerAs: 'vm',
  controller: customButtonGroupFormController,
  templateUrl: '/static/generic_object/custom_button_group_form.html.haml',
});

window.customButtonGroupFormController = function() {
  var vm = this;

  vm.iconSelect = function(selectedIcon) {
    vm.model.button_icon = selectedIcon;
  };
}
