ManageIQ.angular.app.component('customButtonGroupFormComponent', {
  bindings: {
    angularForm: '<',
    model: '=',
  },
  controllerAs: 'vm',
  controller: customButtonGroupFormController,
  templateUrl: '/static/generic_object/custom_button_group_form.html.haml',
});

function customButtonGroupFormController() {
  var vm = this;

  vm.$onInit = function() {
  };

  vm.iconSelect = function(selectedIcon) {
    vm.model.button_icon = selectedIcon;
  };
}
