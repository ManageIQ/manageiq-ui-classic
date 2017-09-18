/* global miqJqueryRequest, miqHttpInject */
(function() {
  var CONTROLLER_NAME = 'explorerListnavController';

  var ExplorerListnavController = function($http, $scope) {
    var vm = this;
    vm.$http = $http;
    vm.$scope = $scope;
    vm.selectedNodes = {};
    vm.isOpen = {};
    vm.data = {};
    vm.urlPrefix = '/';

    ManageIQ.angular.rxSubject.subscribe(function(payload) {
      if (payload.reloadTrees && _.isObject(payload.reloadTrees) && Object.keys(payload.reloadTrees).length > 0) {
        _.forEach(payload.reloadTrees, function(value, key) {
          vm.data[key] = value;
        });
        vm.$scope.$apply();
      }
    });

    $scope.$watch('vm.isOpen', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        var opened = Object.keys(_.pick(newVal, function(val) {
          return val;
        }));

        // This is ugly, but I found nothing better
        // FIXME: this should be fully done using Redux
        if (opened.length === 1 && Object.keys(newVal) !== 1) {
          var url = vm.urlPrefix + '?id=' + encodeURIComponent(opened[0]);
          miqJqueryRequest(url, {beforeSend: true, complete: true});
        }
      }
    }, true);

    vm.initTree = function(tree, data, selected) {
      vm.data[tree] = vm.data[tree] || data;
      vm.selectedNodes[tree] = vm.selectedNodes[tree] || { key: selected };
    };

    vm.initAccord = function(name, selected) {
      vm.isOpen[name] = selected;
    };

    vm.setUrlPrefix = function(url) {
      vm.urlPrefix = url;
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

  ExplorerListnavController.$inject = ['$http', '$scope'];
  miqHttpInject(angular.module('ManageIQ.explorerListnav')).controller(CONTROLLER_NAME, ExplorerListnavController);
})();
