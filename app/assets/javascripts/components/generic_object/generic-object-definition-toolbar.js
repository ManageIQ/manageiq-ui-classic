ManageIQ.angular.app.component('genericObjectDefinitionToolbar', {
  bindings: {
    recordId: '=?',
    entityName: '@?',
    redirectUrl: '@?',
  },
  controllerAs: 'toolbar',
  controller: genericObjectDefinitionToolbarController,
});

genericObjectDefinitionToolbarController.$inject = ['API', 'miqService', '$window'];

function genericObjectDefinitionToolbarController(API, miqService, $window) {
  var toolbar = this;
  var subscription = null;

  toolbar.$onInit = function() {
    subscription = listenToRx(function(event) {
      toolbar.action = event.type;

      if (event.entity && (toolbar.recordId || ManageIQ.gridChecks.length > 0)) {
        toolbar.entity = event.entity;

        if (toolbar.recordId) {
          toolbar.genericObjectDefinitions = _.union(toolbar.genericObjectDefinitions, [toolbar.recordId]);
        } else {
          toolbar.genericObjectDefinitions = ManageIQ.gridChecks;
        }
        postGenericObjectDefinitionAction();
      }
    });
  };

  toolbar.$onDestroy = function() {
    subscription.unsubscribe();
  };

  // private functions
  function postGenericObjectDefinitionAction() {
    var currentRecordId = toolbar.recordId || ManageIQ.record.recordId;
    if (toolbar.action === 'delete' && !currentRecordId) {
      _.forEach(toolbar.genericObjectDefinitions, function(recordId) {
        API.get('/api/generic_object_definitions/' + recordId + '?attributes=generic_objects_count')
          .then(checkGenericObjectCountAndDelete)
          .catch(miqService.handleFailure);
      });
    } else if (toolbar.action === 'delete' && currentRecordId) {
      deleteWithAPI('/api/generic_object_definitions/', currentRecordId);
    } else if (toolbar.action === 'delete_custom_button_set' && currentRecordId) {
      deleteWithAPI('/api/custom_button_sets/', currentRecordId);
    } else if (toolbar.action === 'delete_custom_button' && currentRecordId) {
      deleteWithAPI('/api/custom_buttons/', currentRecordId);
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
    var entityName = response.name;
    var saveMsg = sprintf(__('%s: "%s" was successfully deleted'), toolbar.entity, entityName);
    if (toolbar.redirectUrl) {
      miqService.redirectBack(saveMsg, 'success', toolbar.redirectUrl);
    } else {
      miqService.miqFlashLater({message: saveMsg});
      $window.location.reload(true);
    }
  }
}
