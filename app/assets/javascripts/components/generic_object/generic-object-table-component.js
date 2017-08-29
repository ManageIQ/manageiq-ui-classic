ManageIQ.angular.app.component('genericObjectTableComponent', {
  bindings: {
    keys: '=',
    values: '=',
    keyType: '@',
    tableHeaders: '=',
    valueOptions: '=',
    noOfRows: '=',
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
  };

  vm.addRow = function(_currentRow, element, fromDelete) {
    vm.keys.push('');
    vm.noOfRows = _.size(vm.keys);

    if (!fromDelete) {
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
  };
}
