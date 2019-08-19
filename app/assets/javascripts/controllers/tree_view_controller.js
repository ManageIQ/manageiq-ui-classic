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

      if (payload.breadcrumbSelect) {
        vm.nodeSelect({key: payload.breadcrumbSelect.key}, payload.breadcrumbSelect.path);
      }

      if (payload.requestNodeHierarchy) {
        vm.propagateNode(payload.tree, payload.requestNodeHierarchy);
      }
    });

    vm.initData = function(tree, selected) {
      vm.data[tree] = vm.data[tree] || ManageIQ.tree.data[tree];
      delete ManageIQ.tree.data[tree];
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

    vm.propagateNode = function(tree, key) {
      var path = vm.findNodePath(vm.data[tree], key);
      if (path) {
        sendDataWithRx({treeNodeHierarchy: path});
      }
    };

    vm.findNodePath = function(nodes, key, path) {
      if (path === undefined) {
        path = [];
      }

      for (var i = 0; i < nodes.length; i++) {
        var result = path.concat({
          key: nodes[i].key,
          title: nodes[i].text,
        });

        if (nodes[i].key === key) {
          return result;
        }

        if (nodes[i].nodes) {
          result = vm.findNodePath(nodes[i].nodes, key, result);
          if (result) {
            return result;
          }
        }
      }
    };
  };

  TreeViewController.$inject = ['$http', '$scope'];
  window.miqHttpInject(angular.module('ManageIQ.treeView')).controller(CONTROLLER_NAME, TreeViewController);
})();
