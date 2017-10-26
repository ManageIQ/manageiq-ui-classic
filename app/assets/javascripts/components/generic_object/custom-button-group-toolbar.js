ManageIQ.angular.app.component('customButtonGroupToolbar', {
  bindings: {
    recordId: '@',
    redirectUrl: '@',
    entity: '@',
    entityName: '@',
  },
  controllerAs: 'toolbar',
  controller: customButtonGroupToolbarController,
});

customButtonGroupToolbarController.$inject = ['API', 'miqService', '$window'];

function customButtonGroupToolbarController(API, miqService, $window) {
  var toolbar = this;

  ManageIQ.angular.rxSubject.subscribe(function(event) {
    toolbar.action = event.type;

    if (toolbar.action) {
      if (toolbar.action === 'delete' && toolbar.recordId) {
        deleteWithAPI(toolbar.recordId);
      }
    }
  });

  // private functions

  function deleteWithAPI(id) {
    API.post('/api/custom_button_sets/' + id, { action: 'delete' })
      .then(postAction)
      .catch(miqService.handleFailure);
  }

  function postAction(response) {
    var saveMsg = sprintf(__('%s:"%s" was successfully deleted'), toolbar.entity, toolbar.entityName);
    if (toolbar.redirectUrl) {
      miqService.redirectBack(saveMsg, 'success', toolbar.redirectUrl);
    } else {
      miqService.miqFlashLater({message: saveMsg});
      $window.location.reload(true);
    }
  }
}
