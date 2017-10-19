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
    setGenericObjectDefinitionNodes();
  };

  vm.nodeSelect = function(node) {
  };

  // private functions

  function setGenericObjectDefinitionNodes() {
    API.get('/api/generic_object_definitions?expand=resources&attributes=name,picture.image_href&sort_by=name&sort_options=ignore_case&sort_order=asc')
      .then(setNodes)
      .catch(miqService.handleFailure);
  }

  function setNodes(response) {
    var image;
    var icon;
    var godNodes = [];
    var treeDataObj = [];

    _.forEach(response.resources, function(resource) {
      if (resource.picture && resource.picture.image_href) {
        image = resource.picture.image_href;
        icon = undefined;
      } else {
        image = undefined;
        icon = 'fa fa-file-text-o';
      }

      godNodes.push({
        key: 'god_' + resource.id,
        text: resource.name,
        tooltip: resource.name,
        image: image,
        icon: icon,
        state: {expanded: false},
      });
    });

    treeDataObj = [{
      key: 'god_root',
      text: __('All Generic Object Classes'),
      tooltip: __('All Generic Object Classes'),
      icon: 'pficon pficon-folder-close',
      state: {expanded: true},
      nodes: godNodes,
    }];

    vm.treeData = JSON.stringify(treeDataObj);
  }
}
