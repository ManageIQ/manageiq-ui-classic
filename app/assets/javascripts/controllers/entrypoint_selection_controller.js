/* global miqJqueryRequest */

(function() {
  var CONTROLLER_NAME = 'entrypointSelectionController';

  var EntrypointSelectionController = function($http, $uibModal) {
    var vm = this;
    vm.$http = $http;
    vm.$uibModal = $uibModal;

    vm.$http.get('/tree/automate_entrypoint').then(function(response) {
      vm.data = response.data;
    });

    vm.lazyLoad = function(node) {
      return new Promise(function(resolve) {
        vm.$http.get('/tree/automate_entrypoint?id=' + encodeURIComponent(node.key)).then(function(response) {
          resolve(response.data);
        });
      });
    };

    vm.openModal = function(field) {
      vm.field = field;
      if (vm[vm.field]) {
        var items = vm[vm.field].split('/');
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
    };

    vm.onSelect = function(node) {
      vm[vm.field] = node.fqname;
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
