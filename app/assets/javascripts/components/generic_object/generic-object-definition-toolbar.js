ManageIQ.angular.app.component('genericObjectDefinitionToolbar', {
  bindings: {
    recordId: '=?',
    entity: '@',
    entityName: '@?',
    redirectUrl: '@?',
  },
  controllerAs: 'toolbar',
  controller: genericObjectDefinitionToolbarController,
});

genericObjectDefinitionToolbarController.$inject = ['API', 'miqService', '$window'];

function genericObjectDefinitionToolbarController(API, miqService, $window) {
  var toolbar = this;

  if (ManageIQ.angular.genericObjectDefinitionSubsription) {
    ManageIQ.angular.genericObjectDefinitionSubsription.dispose();
  }

  ManageIQ.angular.genericObjectDefinitionSubsription = ManageIQ.angular.rxSubject.subscribe(function(event) {
    toolbar.action = event.type;

    if (toolbar.action) {
      if (toolbar.recordId) {
        toolbar.genericObjectDefinitions = _.union(toolbar.genericObjectDefinitions, [toolbar.recordId]);
      } else {
        toolbar.genericObjectDefinitions = ManageIQ.gridChecks;
      }
      postGenericObjectDefinitionAction();
    }
  });

  // private functions
  function postGenericObjectDefinitionAction() {
    if (toolbar.action === 'delete' && ! toolbar.recordId) {
      _.forEach(toolbar.genericObjectDefinitions, function(recordId) {
        API.get('/api/generic_object_definitions/' + recordId + '?attributes=generic_objects_count')
          .then(checkGenericObjectCountAndDelete)
          .catch(miqService.handleFailure);
      });
    } else if (toolbar.action === 'delete' && toolbar.recordId) {
      deleteWithAPI('/api/generic_object_definitions/', toolbar.recordId);
    } else if (toolbar.action === 'delete_custom_button_set' && toolbar.recordId) {
      deleteWithAPI('/api/custom_button_sets/', toolbar.recordId);
    }

  }

  function checkGenericObjectCountAndDelete(response) {
    if (response.generic_objects_count === 0) {
      deleteWithAPI('/api/generic_object_definitions/', response.id);
    } else {
      miqService.miqFlashLater(
        { message: sprintf(__('%s "%s" with %s instances cannot be deleted'), toolbar.entity, toolbar.entityName || response.name, response.generic_objects_count),
          level: 'warning'});
      $window.location.reload(true);
    }
  }

  function deleteWithAPI(api, id) {
    API.post(api + id, { action: 'delete' })
      .then(postAction)
      .catch(miqService.handleFailure);
  }

  function postAction(response) {
    var saveMsg = sprintf(__('%s:"%s" was successfully deleted'), toolbar.entity, toolbar.entityName || response.name);
    if (toolbar.redirectUrl) {
      miqService.redirectBack(saveMsg, 'success', toolbar.redirectUrl);
    } else {
      miqService.miqFlashLater({message: saveMsg});
      $window.location.reload(true);
    }
  }
}
