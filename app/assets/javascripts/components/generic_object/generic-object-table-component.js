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

genericObjectTableController.$inject = [];

function genericObjectTableController() {
  var vm = this;

  vm.$onInit = function() {
    vm.tableHeaders.push('', '');
  };

  vm.addRow = function(_currentRow) {
    vm.keys.push('');
    vm.noOfRows = _.size(vm.keys);
  };

  vm.deleteRow = function(currentRow) {
    _.pullAt(vm.keys, [currentRow]);

    if (vm.values) {
      _.pullAt(vm.values, [currentRow]);
    }
    vm.noOfRows = _.size(vm.keys);
  };
}
