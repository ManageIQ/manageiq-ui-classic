ManageIQ.angular.app.service('dialogFieldRefreshService', ['API', function(API) {
  this.refreshField = function(dialogData, dialogField, url, idList) {
    this.areFieldsBeingRefreshed = true;
    var data = angular.toJson({
      action: 'refresh_dialog_fields',
      resource: {
        dialog_fields: dialogData,
        fields: dialogField,
        resource_action_id: idList.resourceActionId,
        target_id: idList.targetId,
        target_type: idList.targetType,
        real_target_type: idList.realTargetType,
      },
    });

    return new Promise(function(resolve) {
      API.post(url + idList.dialogId, data).then(function(response) {
        resolve(response.result[dialogField]);
        if ($.active < 1) {
          this.areFieldsBeingRefreshed = false;
        }
      }.bind(this));
    }.bind(this));
  };
}]);
