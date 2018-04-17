ManageIQ.angular.app.component('physicalServerToolbar', {
  bindings: {
    physicalServerId: '=?',
  },
  controllerAs: 'toolbar',
  controller: physicalServerToolbarController,
});

physicalServerToolbarController.$inject = ['API', 'miqService'];

function physicalServerToolbarController(API, miqService) {
  var toolbar = this;

  listenToRx(function(event) {
    if (event.controller !== 'physicalServerToolbarController') {
      return;
    }

    toolbar.action = event.type;

    if (toolbar.action) {
      if (toolbar.physicalServerId) {
        toolbar.servers = _.union(toolbar.servers, [toolbar.physicalServerId]);
      } else {
        toolbar.servers = ManageIQ.gridChecks;
      }
      postPhysicalServerAction();
    }
  });

  // private functions
  function postPhysicalServerAction() {
    _.forEach(toolbar.servers, function(serverId) {
      API.post('/api/physical_servers/' + serverId, { action: toolbar.action })
        .then(postAction)
        .catch(miqService.handleFailure);
    });
  }

  function postAction(_response) {
    // Use this to display messages individually
    // miqService.miqFlashLater({ message: response.message });
    // miqService.miqFlashSaved();

    if (toolbar.servers.length > 1) {
      miqService.miqFlash('success', sprintf(__('Requested Server %s for the selected servers'), toolbar.action));
    } else {
      miqService.miqFlash('success', sprintf(__('Requested Server %s for the selected server'), toolbar.action));
    }
  }
}
