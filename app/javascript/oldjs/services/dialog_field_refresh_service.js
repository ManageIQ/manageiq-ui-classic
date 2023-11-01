ManageIQ.angular.app.service('dialogFieldRefreshService', ['API', 'DialogData', function(API, DialogData) {
  var self = this;

  self.refreshField = function(dialogData, dialogField, url, idList) {
    console.log('222')
    self.areFieldsBeingRefreshed = true;

    var data = {
      action: 'refresh_dialog_fields',
      resource: {
        dialog_fields: DialogData.outputConversion(dialogData),
        fields: dialogField,
        resource_action_id: idList.resourceActionId,
        target_id: idList.targetId,
        target_type: idList.targetType,
        real_target_type: idList.realTargetType,
      },
    };

    return API.post(url + idList.dialogId, angular.toJson(data))
      .then(function(response) {
        console.log('333=', response);
        // FIXME: API requests don't actually count towards $.active
        if ($.active < 1) {
          self.areFieldsBeingRefreshed = false;
        }

        return response.result[dialogField];
      });
  };
}]);
