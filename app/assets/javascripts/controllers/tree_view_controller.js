/* global miqJqueryRequest */
(function() {
  var CONTROLLER_NAME = 'treeViewController';

  var TreeViewController = function($http, $scope) {
    var vm = this;
    vm.$http = $http;
    vm.$scope = $scope;
    vm.selectedNodes = {};
    vm.data = {};

    listenToRx(function(payload) {
      if (payload.reloadTrees && _.isObject(payload.reloadTrees) && Object.keys(payload.reloadTrees).length > 0) {
        _.forEach(payload.reloadTrees, function(value, key) {
          vm.data[key] = value;
        });
        vm.$scope.$apply();
      }

      if (payload.updateTreeNode && _.isObject(payload.updateTreeNode) && Object.keys(payload.updateTreeNode).length > 0) {
        vm.updateTreeNode(payload.updateTreeNode);
        vm.$scope.$apply();
      }
    });

    /**
     * @return {undefined}
     * @param {Object} data must have specified structure to match the tree:
     * {
     *   tree: 'rbac_tree', // name of some first level sub-tree
     *   key: 'xx-u', // key of targeted node that should be updated
     *   data: { // attributes that should be updated. They must have the original structure
     *     nodes: [some array of nodes],
     *     state: ...
     *   },
     * },
     * @description Function that tries to update specified tree node with new data. Node is updated based on the path
     * through the tree @see vm.findNodePath
     */
    vm.updateTreeNode = function(data) {
      if (vm.data[data.tree]) {
        vm.data[data.tree].forEach(function(node, index) {
          vm.findNodePath(node, data.key, '[' + index + ']');
          if (vm.nodePath !== undefined) {
            Object.keys(data.data).forEach(function(key) {
              _.set(vm.data, data.tree + vm.nodePath + '.' + key, data.data[key]);
              vm.nodePath = undefined;
            });
            vm.data = angular.copy(vm.data);
          }
        });
      } else {
        console.warn('Sub tree' + data.tree + ', cloud not be reloaded, because it is not in current tree');
      }
    };

    /**
     * @return {string}
     * @param {Object} node tree node
     * @param {string} target key of node that should be updated
     * @param {string} path current path to the node
     * @description Function that is traversing the tree and looking for the target node. The target is determined by the node key.
     * If the target is found, it will store its location is stored inside variable for further use.
     */
    vm.findNodePath = function(node, target, path) {
      if (path === undefined) {
        path = '';
      }
      if (node.key === target) {
        vm.nodePath = path;
        return path;
      }
      if (node.nodes) {
        node.nodes.forEach(function(child, index) {
          vm.findNodePath(child, target, path + '.nodes[' + index + ']');
        });
      }
    };

    vm.initSelected = function(tree, node) {
      vm.selectedNodes[tree] = vm.selectedNodes[tree] || { key: node };
    };

    vm.initData = function(tree, data, selected) {
      vm.data[tree] = vm.data[tree] || data;
      vm.selectedNodes[tree] = vm.selectedNodes[tree] || { key: selected };
    };

    vm.lazyLoad = function(node, name, url) {
      return new Promise(function(resolve) {
        vm.$http.post(url, {
          id: node.key,
          tree: name,
          mode: 'all',
        }).then(function(response) {
          resolve(response.data);
        });
      });
    };

    vm.nodeSelect = function(node, path) {
      var url = path + '?id=' + encodeURIComponent(node.key.split('__')[0]);
      miqJqueryRequest(url, {beforeSend: true});
    };
  };

  TreeViewController.$inject = ['$http', '$scope'];
  window.miqHttpInject(angular.module('ManageIQ.treeView')).controller(CONTROLLER_NAME, TreeViewController);
})();
