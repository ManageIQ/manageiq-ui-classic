ManageIQ.angular.app.service('dialogFieldRefreshService', ['miqService', function(miqService) {
  this.areFieldsBeingRefreshed = false;

  this.refreshField = function(dialogData, dialogField, url, resourceId) {
    this.areFieldsBeingRefreshed = true;
    var data = angular.toJson({
      action: 'refresh_dialog_fields',
      resource: {
        dialog_fields: dialogData,
        fields: dialogField,
      },
    });

    return new Promise(function(resolve) {
      miqService.jqueryRequest(url + resourceId, {data: data, dataType: 'json'}).then(function(response) {
        resolve(response.result[dialogField]);
        if ($.active < 1) {
          this.areFieldsBeingRefreshed = false;
        }
      }.bind(this));
    }.bind(this));
  };
}]);
