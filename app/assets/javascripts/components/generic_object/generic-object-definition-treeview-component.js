ManageIQ.angular.app.component('genericObjectDefinitionTreeviewComponent', {
  bindings: {
    recordId: '@?',
    showListUrl: '@',
    showUrl: '@',
  },
  controllerAs: 'vm',
  controller: genericObjectDefinitionTreeviewController,
  templateUrl: '/static/generic_object/generic_object_definition_treeview.html.haml',
});

genericObjectDefinitionTreeviewController.$inject = ['API', 'miqService'];

function genericObjectDefinitionTreeviewController(API, miqService) {
  var vm = this;

  vm.treeData = [];

  vm.$onInit = function() {
  };

  vm.nodeSelect = function(node) {
  };

  // private functions
}
