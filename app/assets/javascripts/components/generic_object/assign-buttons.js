ManageIQ.angular.app.component('assignButtons', {
  bindings: {
    assignedButtons: '<',
    unassignedButtons: '<',
    updateButtons: '<'
  },
  require: {
    parent: '^^mainCustomButtonGroupForm'
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

  function getIndexes(arr, ids) {
    var indexes= [];
    ids.forEach(function (id) {
      var i = arr.findIndex(function(el){
        return el.id == id;
      });
      if (i >= 0){
        indexes.push(i);
      }
    });
    return indexes;
  };

  vm.$onInit = function() {
    vm.model.assignedButtons = [].concat(vm.assignedButtons);
    vm.model.unassignedButtons = [].concat(vm.unassignedButtons);
  };

  function filterIndexes(indexes) {
    if (indexes[0] !== 0) {
      return indexes;
    }
    var previous = 0;
    var filteredIndexes = [];
    indexes.forEach(function(index) {
      if (index !== 0 && index - 1 !== previous) {
        filteredIndexes.push(index);
      } else {
        previous = index;
      }
    });
    return filteredIndexes;
  };

  function filterReverseIndexes(indexes, endIndex) {
    if (indexes[0] !== endIndex) {
      return indexes;
    }
    var previous = endIndex;
    var filteredIndexes = [];
    indexes.forEach(function(index) {
      if (index !== endIndex && index + 1 !== previous) {
        filteredIndexes.push(index);
      } else {
        previous = index;
      }
    });
    return filteredIndexes;
  };

  function copyData() {
    vm.model.assignedButtons = [].concat(vm.assignedButtons);
    vm.model.unassignedButtons = [].concat(vm.unassignedButtons);
  };

  vm.leftButtonClicked = function() {
    copyData();
    var indexes = getIndexes(vm.model.assignedButtons, vm.model.selectedAssignedButtons);
    var movedElements = [];
    indexes.forEach(function(index) {
      movedElements.push(vm.model.assignedButtons[index]);
    });
    _.remove(vm.model.assignedButtons, function(n) { return movedElements.includes(n) });
    vm.model.unassignedButtons = vm.model.unassignedButtons.concat( movedElements);
    vm.updateButtons(vm.model.assignedButtons, vm.model.unassignedButtons);
  };

  vm.rightButtonClicked = function() {
    copyData();
    var indexes = getIndexes(vm.model.unassignedButtons, vm.model.selectedUnassignedButtons);
    var movedElements = [];
    indexes.forEach(function(index) {
      movedElements.push(vm.model.unassignedButtons[index]);
    });
    _.remove(vm.model.unassignedButtons, function(n) { return movedElements.includes(n) });
    vm.model.assignedButtons = vm.model.assignedButtons.concat( movedElements);
    vm.updateButtons(vm.model.assignedButtons, vm.model.unassignedButtons);
  };

  vm.upButtonClicked = function() {
    copyData();
    var indexes = getIndexes(vm.model.assignedButtons, vm.model.selectedAssignedButtons);
    indexes = filterIndexes(indexes);
    indexes.forEach(function(index) {
      if (index > 0) {
        var temp = vm.model.assignedButtons[index];
        vm.model.assignedButtons[index] = vm.model.assignedButtons[index - 1];
        vm.model.assignedButtons[index - 1] = temp;
      }
    });
    vm.updateButtons(vm.model.assignedButtons, vm.model.unassignedButtons);
  };

  vm.downButtonClicked = function() {
    copyData();
    var indexes = getIndexes(vm.model.assignedButtons, vm.model.selectedAssignedButtons).reverse();
    indexes = filterReverseIndexes(indexes, vm.model.assignedButtons.length - 1);
    indexes.forEach(function(index) {
      if (index < vm.model.assignedButtons.length - 1) {
        var temp = vm.model.assignedButtons[index];
        vm.model.assignedButtons[index] = vm.model.assignedButtons[index + 1];
        vm.model.assignedButtons[index + 1] = temp;
      }
    });
    vm.updateButtons(vm.model.assignedButtons, vm.model.unassignedButtons);
  };

  vm.topButtonClicked = function() {
    copyData();
    var indexes = getIndexes(vm.model.assignedButtons, vm.model.selectedAssignedButtons);
    var movedElements = [];
    indexes.forEach(function(index) {
      movedElements.push(vm.model.assignedButtons[index]);
    });
    _.remove(vm.model.assignedButtons, function(n) { return movedElements.includes(n) });
    vm.model.assignedButtons = movedElements.concat( vm.model.assignedButtons);
    vm.updateButtons(vm.model.assignedButtons, vm.model.unassignedButtons);
  };

  vm.bottomButtonClicked = function() {
    copyData();
    var indexes = getIndexes(vm.model.assignedButtons, vm.model.selectedAssignedButtons);
    var movedElements = [];
    indexes.forEach(function(index) {
      movedElements.push(vm.model.assignedButtons[index]);
    });
    _.remove(vm.model.assignedButtons, function(n) { return movedElements.includes(n) });
    vm.model.assignedButtons = vm.model.assignedButtons.concat(movedElements);
    vm.updateButtons(vm.model.assignedButtons, vm.model.unassignedButtons);
  };
}
