/* global miqJqueryRequest */
(function() {
  var CONTROLLER_NAME = 'treeViewController';

  var TreeViewController = function($http) {
    var vm = this;
    vm.$http = $http;
    vm.selectedNodes = {};
  };

  TreeViewController.prototype.initSelected = function(tree, node) {
    this.selectedNodes[tree] = this.selectedNodes[tree] || { key: node };
  };

  TreeViewController.prototype.lazyLoad = function(node, name, url) {
    var vm = this;
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

  TreeViewController.prototype.nodeSelect = function(node, path) {
    var url = path + '?id=' + encodeURIComponent(node.key.split('__')[0]);
    miqJqueryRequest(url, {beforeSend: true});
  };

  TreeViewController.$inject = ['$http'];
  window.miqHttpInject(angular.module('ManageIQ.treeView')).controller(CONTROLLER_NAME, TreeViewController);
})();
