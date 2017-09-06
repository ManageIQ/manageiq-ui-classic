ManageIQ.angular.app.service('dialogFieldRefreshService', ['miqService', function(miqService) {
  this.refreshField = function(dialogData, dialogField, url, resourceId) {
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
      });
    });
  };
}]);
