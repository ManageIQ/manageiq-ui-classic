ManageIQ.angular.app.service('dialogFieldRefreshService', ['miqService', function(miqService) {
  this.areFieldsBeingRefreshed = false;

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
      },
    });

    return new Promise(function(resolve) {
      miqService.jqueryRequest(url + idList.dialogId, {data: data, dataType: 'json'}).then(function(response) {
        resolve(response.result[dialogField]);
        if ($.active < 1) {
          this.areFieldsBeingRefreshed = false;
        }
      }.bind(this));
    }.bind(this));
  };
}]);
