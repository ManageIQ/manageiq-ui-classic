ManageIQ.angular.app.component('genericObjectTableComponent', {
  bindings: {
    keys: '=',
    values: '=',
    keyType: '@',
    addRowText: '@',
    tableHeaders: '=',
    valueOptions: '<',
    newRecord: '<',
    noOfRows: '=',
    origKeysValues: '<',
    tableChanged: '=',
    requiredRule: '@?',
    tableRendered: '=',
    uniqueProperty: '&',
    noPattern: '<',
    addValueColumn: '<',
    angularForm: '<',
  },
  controllerAs: 'vm',
  controller: genericObjectTableController,
  templateUrl: '/static/generic_object/generic_object_table.html.haml',
});

genericObjectTableController.$inject = ['$timeout'];

function genericObjectTableController($timeout) {
  var vm = this;

  vm.$onInit = function() {
    vm.dupicatePropertyError = [];
    vm.invalidKeyName = __('Invalid name');
    vm.tableRendered = true;

    if (vm.newRecord) {
      vm.addRow(vm.keyType + '0', true);
    }
  };

  vm.addRow = function(element, addFromOtherSource) {
    vm.keys.push('');
    vm.noOfRows = _.size(vm.keys);

    if (! addFromOtherSource) {
      $timeout(function() {
        angular.element('#' + element).focus();
      });
    }
  };

  vm.deleteRow = function(currentRow) {
    _.pullAt(vm.keys, [currentRow]);

    if (vm.values) {
      _.pullAt(vm.values, [currentRow]);
    }
    vm.noOfRows = _.size(vm.keys);
    recalibrateDupes();

    if (vm.noOfRows === 0) {
      vm.addRow(vm.keyType + '0', true);
    }
    checkIfTableChanged();
  };

  vm.tableCellValueChanged = function(element) {
    checkIfTableChanged();

    if (element) {
      setDuplicateKeyError(element);
    }
  };

  // private functions

  function recalibrateDupes() {
    if (vm.noOfRows === 0) {
      vm.angularForm[vm.keyType + '0'].$setValidity('duplicateProperty', true);
    } else {
      _.times(vm.noOfRows, function(index) {
        setDuplicateKeyError(undefined, index);
      });
    }
  }

  function setDuplicateKeyError(element, index) {
    var possibleDupeKey;
    var dupeErrorIndex;
    var cellElement;
    if (angular.isDefined(index)) {
      possibleDupeKey = vm.keys[index];
      dupeErrorIndex = vm.keyType + index;
      cellElement = vm.angularForm[vm.keyType + index];
    } else {
      possibleDupeKey = element.$viewValue;
      dupeErrorIndex = element.$name;
      cellElement = element;
    }

    if (_.includes(vm.uniqueProperty(), possibleDupeKey)
      || _.includes(getCurrentUniqueArrayValues(possibleDupeKey), possibleDupeKey)) {
      vm.dupicatePropertyError[dupeErrorIndex] = sprintf(__('Property Name "%s" is not unique'), possibleDupeKey);
      cellElement.$setValidity('duplicateProperty', false);
    } else {
      cellElement.$setValidity('duplicateProperty', true);
    }
  }

  function getCurrentUniqueArrayValues(currentKey) {
    var uniqueArr = Object.assign([], vm.keys);
    _.forEach(uniqueArr, function(key, index) {
      if (key === currentKey) {
        _.pullAt(uniqueArr, [index]);
        return false;
      }
      return true;
    });
    return uniqueArr;
  }

  function checkIfTableChanged() {
    if (vm.values && ! angular.equals(_.zipObject(vm.keys, vm.values), vm.origKeysValues)
      || ! vm.values && _.difference(vm.keys, vm.origKeysValues).length > 0) {
      vm.tableChanged = true;
    } else {
      vm.tableChanged = false;
    }
  }
}
