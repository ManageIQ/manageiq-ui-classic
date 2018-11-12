ManageIQ.angular.app.component('dropdownMenu', {
  bindings: {
    widgetId: '@',
    buttonsData: '@',
  },
  controllerAs: 'vm',
  controller: function() {
    var vm = this;

    this.$onInit = function() {
      vm.dropdown_id = 'btn_' + vm.widgetId;
      vm.buttons = JSON.parse(vm.buttonsData);
    };
  },
  templateUrl: '/static/dropdown-menu.html.haml',
});
