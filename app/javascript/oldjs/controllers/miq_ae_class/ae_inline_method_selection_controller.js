/* global miqJqueryRequest, miqPassFields */
(function() {
  var AeInlineMethodSelectionController = function($http, $uibModal) {
    var vm = this;
    vm.$http = $http;
    vm.$uibModal = $uibModal;

    vm.includeDomain = false;

    vm.$http.get('/tree/automate_inline_methods').then(function(response) {
      vm.data = response.data;
    });
  };

  AeInlineMethodSelectionController.prototype.lazyLoad = function(node) {
    return this.$http.get('/tree/automate_inline_methods?id=' + encodeURIComponent(node.key))
      .then(function(response) {
        return response.data;
      });
  };

  AeInlineMethodSelectionController.prototype.openModal = function() {
    this.modal = this.$uibModal.open({
      templateUrl: '/static/automate-selection-modal.html',
      keyboard: false,
      backdrop: 'static',
      size: 'lg',
      controllerAs: '$ctrl',
      controller: ['parent', function(parent) {
        this.parent = parent;
      }],
      resolve: {
        parent: function() {
          return this;
        }.bind(this),
      },
    });
  };

  AeInlineMethodSelectionController.prototype.onSelect = function(node) {
    var fqname = node.fqname;
    // Chop the first part of the fqname if includeDomain is set to false
    if (this.includeDomain === false) {
      fqname = fqname.split('/');
      fqname.splice(1, 1);
      fqname = fqname.join('/');
    }

    var url = '/' + ManageIQ.controller + '/embedded_methods_add';
    miqJqueryRequest(miqPassFields(url, {fqname: fqname}));

    this.modal.close();
  };

  AeInlineMethodSelectionController.prototype.closeModal = function() {
    this.modal.close();
  };

  AeInlineMethodSelectionController.$inject = ['$http', '$uibModal'];

  angular.module('ManageIQ').controller('aeInlineMethodSelectionController', AeInlineMethodSelectionController);
})();
