ManageIQ.angular.app.component('assignButtons', {
  bindings: {
    assignedButtons: '<',
    unassignedButtons: '<',
    updateButtons: '<',
  },
  require: {
    parent: '^^mainCustomButtonGroupForm',
  },
  controllerAs: 'vm',
  controller: assignButtonsController,
  templateUrl: '/static/generic_object/assign-buttons.html.haml',
});

function assignButtonsController() {
  var vm = this;

  vm.model = {
    selectedAssignedButtons: [],
    selectedUnassignedButtons: [],
  };

  vm.leftButtonClicked = function() {
    var ret = ManageIQ.move.between({
      from: [].concat(vm.assignedButtons),
      to: [].concat(vm.unassignedButtons),
      selected: vm.model.selectedAssignedButtons,
    });

    vm.updateButtons(ret.from, ret.to);
  };

  vm.rightButtonClicked = function() {
    var ret = ManageIQ.move.between({
      from: [].concat(vm.unassignedButtons),
      to: [].concat(vm.assignedButtons),
      selected: vm.model.selectedUnassignedButtons,
    });

    vm.updateButtons(ret.to, ret.from);
  };

  function wrap(fn) {
    return function() {
      var assigned = fn({
        array: [].concat(vm.assignedButtons),
        selected: vm.model.selectedAssignedButtons,
      });

      vm.updateButtons(assigned);
    };
  }

  vm.topButtonClicked = wrap(ManageIQ.move.top);
  vm.bottomButtonClicked = wrap(ManageIQ.move.bottom);

  vm.upButtonClicked = wrap(ManageIQ.move.up);
  vm.downButtonClicked = wrap(ManageIQ.move.down);
}
