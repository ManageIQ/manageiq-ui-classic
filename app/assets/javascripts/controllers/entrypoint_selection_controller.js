/* global miqJqueryRequest */

(function() {
  var CONTROLLER_NAME = 'entrypointSelectionController';

  var EntrypointSelectionController = function($http, $uibModal) {
    var vm = this;
    vm.$http = $http;
    vm.$uibModal = $uibModal;
    vm.cache = {};

    vm.$http.get('/tree/automate_entrypoint').then(function(response) {
      vm.data = response.data;
    });

    vm.lazyLoad = function(node) {
      return new Promise(function(resolve) {
        vm.$http.get('/tree/automate_entrypoint?id=' + encodeURIComponent(node.key)).then(function(response) {
          vm.cache[node.key] = response.data;
          resolve(response.data);
        });
      });
    };

    vm.openModal = function(field, showInclude, includeDomain) {
      vm.field = field;
      vm.showInclude = showInclude;
      vm.includeDomain = includeDomain;

      if (vm[vm.field]) {
        var fqname = vm[vm.field + '_selected'] || vm[vm.field];
        var items = fqname.split('/');
        var selected = items.map(function(_item, index) {
          return {
            fqname: items.slice(0, index + 1).join('/'),
          };
        });
        selected.shift();
        vm.selected = selected;
      }
      vm.modal = vm.$uibModal.open({
        templateUrl: '/static/entrypoint-modal.html',
        windowClass: 'entrypoint-modal',
        keyboard: false,
        size: 'lg',
        controllerAs: '$ctrl',
        controller: ['parent', function(parent) { this.parent = parent; }], // this this is not the this you would want as vm
        resolve: {
          parent: function() {
            return vm;
          },
        },
      });
    };

    vm.closeModal = function() {
      delete vm.field;
      vm.modal.close();

      // Traverse the tree data
      var stack = vm.data.slice();
      var item = stack.pop();
      while (item) {
        if (item.key && vm.cache[item.key]) {
          // Store the lazily loaded data
          item.nodes = vm.cache[item.key];
          item.state.expanded = true;
          // Turn off the lazyLoading
          delete item.lazyLoad;
        }

        if (item.nodes) {
          item.nodes.forEach(function(n) {
            stack.push(n);
          });
        }

        item = stack.pop();
      }

      // Clear the cache
      vm.cache = {};
    };

    vm.onSelect = function(node) {
      var fqname = node.fqname.split('/');
      if (vm.includeDomain === false) {
        fqname.splice(1, 1);
      }
      vm[vm.field + '_selected'] = node.fqname;
      vm[vm.field] = fqname.join('/');
      angular.element('#' + vm.field).trigger('change');
      vm.closeModal();
    };

    vm.resetField = function(field) {
      angular.element('#' + field).trigger('change');
      delete vm[field];
    };
  };

  EntrypointSelectionController.$inject = ['$http', '$uibModal'];
  window.miqHttpInject(angular.module('ManageIQ.treeSelector')).controller(CONTROLLER_NAME, EntrypointSelectionController);
})();
