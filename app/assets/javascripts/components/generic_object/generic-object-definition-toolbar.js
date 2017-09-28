ManageIQ.angular.app.component('genericObjectDefinitionToolbar', {
  bindings: {
    genericObjectDefinitionId: '=?',
    redirectUrl: '@?',
  },
  controllerAs: 'toolbar',
  controller: genericObjectDefinitionToolbarController,
});

genericObjectDefinitionToolbarController.$inject = ['API', 'miqService'];

function genericObjectDefinitionToolbarController(API, miqService) {
  var toolbar = this;

  ManageIQ.angular.rxSubject.subscribe(function(event) {
    toolbar.action = event.type;

    if (toolbar.action) {
      if (toolbar.genericObjectDefinitionId) {
        toolbar.genericObjectDefinitions = _.union(toolbar.genericObjectDefinitions, [toolbar.genericObjectDefinitionId]);
      } else {
        toolbar.genericObjectDefinitions = ManageIQ.gridChecks;
      }
      postGenericObjectDefinitionAction();
    }
  });

  // private functions
  function postGenericObjectDefinitionAction() {
    if (toolbar.action === 'delete' && toolbar.genericObjectDefinitionId) {
      deleteWithAPI(toolbar.genericObjectDefinitionId);
    }
  }

  function deleteWithAPI(id) {
    API.post('/api/generic_object_definitions/' + id, { action: 'delete' })
      .then(postAction)
      .catch(miqService.handleFailure);
  }

  function postAction(response) {
    var saveMsg = sprintf(__('Generic Object Class:"%s" was successfully deleted'), response.name);
    miqService.redirectBack(saveMsg, 'success', toolbar.redirectUrl);
  }
}
