describe('treeViewController', function() {
  var $scope;
  var vm;
  var initialData = getJSONFixture('tree_view_controller_initial_data');

  beforeEach(module('ManageIQ.treeView'));

  beforeEach(inject(function($rootScope, _$controller_) {
    $scope = $rootScope.$new();

    vm = _$controller_('treeViewController as vm', {
      $scope: $scope,
    });
    vm.data = angular.copy(initialData);
  }));
});
