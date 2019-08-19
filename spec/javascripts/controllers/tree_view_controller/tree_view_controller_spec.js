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

  it('Should find node path', function() {
    var expectedPath = '[0].nodes[0]';
    var messagePayload = {
      tree: 'rbac_tree',
      key: 'xx-u',
    };
    vm.findNodePath(vm.data[messagePayload.tree][0], messagePayload.key, '[0]');
    expect(vm.nodePath).toBe(expectedPath);
  });
});
