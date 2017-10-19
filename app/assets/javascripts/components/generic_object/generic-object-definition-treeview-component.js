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

genericObjectDefinitionTreeviewController.$inject = ['API', 'miqService', '$window'];

function genericObjectDefinitionTreeviewController(API, miqService, $window) {
  var vm = this;

  vm.treeData = [];

  vm.$onInit = function() {
    setGenericObjectDefinitionNodes();
  };

  vm.nodeSelect = function(node) {
    var key = node.key.split('_');
    miqService.sparkleOn();
    switch(key[0]) {
      case 'god':
        if (key[1] === 'root') {
          $window.location.href = vm.showListUrl;
        } else {
          $window.location.href = vm.showUrl + '/' + key[1];
        }
        break;
      case 'cbs':
        $window.location.href = vm.showUrl + '/' + node.parentNodeId + '?cbs=' + key[1];
        break;
      case 'cb':
        $window.location.href = vm.showUrl + '/' + node.parentNodeId + '?cb=' + key[1];
        break;
      case 'actions':
        $window.location.href = vm.showUrl + '/' + node.parentNodeId + '?actions=true';
        break;
      default:
        $window.location.href = vm.showListUrl;
    }
  };

  // private functions

  function setGenericObjectDefinitionNodes() {
    API.get('/api/generic_object_definitions?expand=resources&attributes=name,picture.image_href,custom_button_sets,custom_buttons&sort_by=name&sort_options=ignore_case&sort_order=asc')
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
        nodes: createCustomButtonAndSetNodes(resource.custom_button_sets, resource.custom_buttons, resource.id),
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

  function createCustomButtonAndSetNodes(cbs, cb, parentNodeId) {
    var childNodes = [];

    if (cbs.length > 0 || cb.length > 0) {
      _.forEach(cbs, function(set) {
        childNodes.push({
          key: 'cbs_' + set.id,
          parentNodeId: parentNodeId,
          text: set.name + ' ' + __('(Group)'),
          tooltip: __('Button Group: ') + set.description,
          icon: set.set_data.button_icon,
          state: {expanded: false}
        });
      });

      _.forEach(cb, function(button) {
        childNodes.push({
          key: 'cb_' + button.id,
          parentNodeId: parentNodeId,
          text: button.name,
          tooltip: button.description,
          icon: button.options.button_icon,
          state: {expanded: false}
        });
      });

      return [{
        key: 'actions_' + parentNodeId,
        parentNodeId: parentNodeId,
        text: __('Actions'),
        tooltip: __('All Actions'),
        icon: 'pficon pficon-folder-close',
        state: {expanded: false},
        nodes: childNodes,
      }];
    } else {
      return undefined;
    }
  }
}
