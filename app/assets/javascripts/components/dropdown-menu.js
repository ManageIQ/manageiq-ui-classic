ManageIQ.angular.app.component('dropdownMenu', {
  bindings: {
    id: '<',
    buttonsData: '@',
  },
  controllerAs: 'vm',
  controller: function() {
    var vm = this;

    this.$onInit = function() {
      vm.dropdown_id = 'btn_' + vm.id;
      vm.buttons = JSON.parse(vm.buttonsData);
    };
  },
  templateUrl: "/static/dropdown-menu.html.haml",
});
