ManageIQ.angular.app.component('genericObjectTableComponent', {
  bindings: {
    keys: '=',
    values: '=',
    keyType: '@',
    tableHeaders: '=',
    valueOptions: '=',
    newRecord: '=',
    noOfRows: '=',
    origKeysValues: '=',
    tableChanged: '=',
    requiredRule: '@?',
    tableRendered: '=',
    angularForm: '=',
  },
  controllerAs: 'vm',
  controller: genericObjectTableController,
  templateUrl: '/static/generic_object/generic_object_table.html.haml',
});

genericObjectTableController.$inject = ['$timeout'];

function genericObjectTableController($timeout) {
  var vm = this;

  vm.$onInit = function() {
    vm.tableHeaders.push('', '');

    vm.invalidKeyName = __("Invalid name");
    vm.tableRendered = true;

    if (vm.newRecord) {
      vm.addRow(0, vm.keyType + '0', true);
    }
  };

  vm.addRow = function(_currentRow, element, addFromOtherSource) {
    vm.keys.push('');
    vm.noOfRows = _.size(vm.keys);

    if (!addFromOtherSource) {
      $timeout(function () {
        angular.element('#' + element).focus();
      }, -1);
    }
  };

  vm.deleteRow = function(currentRow) {
    _.pullAt(vm.keys, [currentRow]);

    if (vm.values) {
      _.pullAt(vm.values, [currentRow]);
    }
    vm.noOfRows = _.size(vm.keys);

    if (vm.noOfRows === 0) {
      vm.addRow(0, vm.keyType + '0', true);
    }
    vm.tableCellValueChanged();
  };

  vm.tableCellValueChanged = function() {
    if (vm.values && !angular.equals(_.zipObject(vm.keys, vm.values), vm.origKeysValues)) {
      vm.tableChanged = true;
    } else if (!vm.values && _.difference(vm.keys, vm.origKeysValues, _.isEqual).length > 0) {
      vm.tableChanged = true;
    }
    else {
      vm.tableChanged = false;
    }
  };
}
