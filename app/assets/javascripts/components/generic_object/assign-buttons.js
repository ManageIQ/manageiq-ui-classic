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


function idsToIndexes(arr, ids) {
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

function idsToElements(arr, ids) {
  return ids.map(function(id) {
    return arr.find(function(el) {
      return el.id === id;
    });
  });
}

function removeElements(arr, elements) {
  _.remove(arr, function(n) {
    return _.some(elements, n);
  });

  return arr;
}

function moveBetween({from, to, selected}) {
  var moved = idsToElements(from, selected);

  return {
    from: removeElements(from, moved),
    to: to.concat(moved),
  };
}

function moveTop({array, selected}) {
  var moved = idsToElements(array, selected);
  array = removeElements(array, moved);

  return moved.concat(array);
}

function moveBottom({array, selected}) {
  var moved = idsToElements(array, selected);
  array = removeElements(array, moved);

  return array.concat(moved);
}


function assignButtonsController() {
  var vm = this;

  vm.model = {
    selectedAssignedButtons: [],
    selectedUnassignedButtons: [],
  };

  vm.leftButtonClicked = function() {
    var ret = moveBetween({
      from: [].concat(vm.assignedButtons),
      to: [].concat(vm.unassignedButtons),
      selected: vm.model.selectedAssignedButtons,
    });

    vm.updateButtons(ret.from, ret.to);
  };

  vm.rightButtonClicked = function() {
    var ret = moveBetween({
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

  vm.topButtonClicked = wrap(moveTop);
  vm.bottomButtonClicked = wrap(moveBottom);


  var getIndexes = idsToIndexes;

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
}
