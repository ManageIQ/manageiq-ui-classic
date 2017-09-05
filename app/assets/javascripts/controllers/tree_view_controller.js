/* global miqJqueryRequest */
(function() {
  var CONTROLLER_NAME = 'treeViewController';

  var TreeViewController = function($http) {
    var vm = this;
    vm.$http = $http;
    vm.selectedNodes = {};
    vm.data = {};

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

  TreeViewController.$inject = ['$http'];
  window.miqHttpInject(angular.module('ManageIQ.treeView')).controller(CONTROLLER_NAME, TreeViewController);
})();
