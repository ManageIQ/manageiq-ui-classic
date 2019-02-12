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

  function getIndexes(arr, ids) {
    var indexes = [];

    ids.forEach(function(id) {
      var i = arr.findIndex(function(el) {
        return el.id === id;
      });

      if (i >= 0) {
        indexes.push(i);
      }
    });

    return indexes;
  }

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
  }

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
  }

  vm.leftButtonClicked = function() {
    var assigned = [].concat(vm.assignedButtons);
    var unassigned = [].concat(vm.unassignedButtons);

    var indexes = getIndexes(assigned, vm.model.selectedAssignedButtons);
    var movedElements = [];
    indexes.forEach(function(index) {
      movedElements.push(assigned[index]);
    });
    _.remove(assigned, function(n) {
      return _.some(movedElements, n);
    });
    unassigned = unassigned.concat(movedElements);

    vm.updateButtons(assigned, unassigned);
  };

  vm.rightButtonClicked = function() {
    var assigned = [].concat(vm.assignedButtons);
    var unassigned = [].concat(vm.unassignedButtons);

    var indexes = getIndexes(unassigned, vm.model.selectedUnassignedButtons);
    var movedElements = [];
    indexes.forEach(function(index) {
      movedElements.push(unassigned[index]);
    });
    _.remove(unassigned, function(n) {
      return _.some(movedElements, n);
    });
    assigned = assigned.concat( movedElements);

    vm.updateButtons(assigned, unassigned);
  };

  vm.upButtonClicked = function() {
    var assigned = [].concat(vm.assignedButtons);

    var indexes = getIndexes(assigned, vm.model.selectedAssignedButtons);
    indexes = filterIndexes(indexes);
    indexes.forEach(function(index) {
      if (index > 0) {
        var temp = assigned[index];
        assigned[index] = assigned[index - 1];
        assigned[index - 1] = temp;
      }
    });

    vm.updateButtons(assigned);
  };

  vm.downButtonClicked = function() {
    var assigned = [].concat(vm.assignedButtons);

    var indexes = getIndexes(assigned, vm.model.selectedAssignedButtons).reverse();
    indexes = filterReverseIndexes(indexes, assigned.length - 1);
    indexes.forEach(function(index) {
      if (index < assigned.length - 1) {
        var temp = assigned[index];
        assigned[index] = assigned[index + 1];
        assigned[index + 1] = temp;
      }
    });

    vm.updateButtons(assigned);
  };

  vm.topButtonClicked = function() {
    var assigned = [].concat(vm.assignedButtons);

    var indexes = getIndexes(assigned, vm.model.selectedAssignedButtons);
    var movedElements = [];
    indexes.forEach(function(index) {
      movedElements.push(assigned[index]);
    });
    _.remove(assigned, function(n) {
      return _.some(movedElements, n);
    });
    assigned = movedElements.concat( assigned);

    vm.updateButtons(assigned);
  };

  vm.bottomButtonClicked = function() {
    var assigned = [].concat(vm.assignedButtons);

    var indexes = getIndexes(assigned, vm.model.selectedAssignedButtons);
    var movedElements = [];
    indexes.forEach(function(index) {
      movedElements.push(assigned[index]);
    });
    _.remove(assigned, function(n) {
      return _.some(movedElements, n);
    });
    assigned = assigned.concat(movedElements);

    vm.updateButtons(assigned);
  };
}
