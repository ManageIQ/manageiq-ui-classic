describe('treeViewController', function() {
  var $scope;
  var vm;
  var initialData = getJSONFixture('tree_view_controller_initial_data');

  beforeEach(module('ManageIQ'));

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

  it('Should update tree data', function() {
    var messagePayload = {
      updateTrees: {
        tree: 'rbac_tree',
        key: 'xx-u',
        data: {
          nodes: [
            {
              'key': 'u-10000000000001',
              'text': 'Administrator',
              'icon': 'pficon pficon-user',
              'selectable': true,
              'state': {
                'expanded': false,
              },
              'class': '',
            },
            {
              'key': 'u-10000000000003',
              'text': 'Ansible Tower ',
              'icon': 'pficon pficon-user',
              'selectable': true,
              'state': {
                'expanded': false,
              },
              'class': '',
            },
            {
              'key': 'u-10000000000008',
              'text': 'Chris Keller',
              'icon': 'pficon pficon-user',
              'selectable': true,
              'state': {
                'expanded': true,
              },
              'class': '',
            },
          ],
        },
        testAttr: 'foo',
      },
    };

    vm.updateTreeNode(messagePayload.updateTrees);
    expect(JSON.stringify(vm.data.rbac_tree[0].nodes[0].nodes)).toEqual(JSON.stringify(messagePayload.updateTrees.data.nodes));
    expect(vm.data.rbac_tree[0].nodes[0].testAttr).toEqual(messagePayload.updateTrees.data.testAttr);
  });
});
