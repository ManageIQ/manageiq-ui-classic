ManageIQ.angular.app.controller('dialogUserController', ['API', 'dialogFieldRefreshService', 'miqService', 'dialogId', 'apiSubmitEndpoint', 'apiAction', 'finishSubmitEndpoint', 'cancelEndpoint', 'resourceActionId', 'targetId', 'targetType', function(API, dialogFieldRefreshService, miqService, dialogId, apiSubmitEndpoint, apiAction, finishSubmitEndpoint, cancelEndpoint, resourceActionId, targetId, targetType) {
  var vm = this;

  vm.$onInit = function() {
    return new Promise(function(resolve) {
      var url = '/api/service_dialogs/' + dialogId +
        '?resource_action_id=' + resourceActionId +
        '&target_id=' + targetId +
        '&target_type=' + targetType;

      resolve(API.get(url, {expand: 'resources', attributes: 'content'}).then(init));
    });
  };

  function init(dialog) {
    vm.dialog = dialog.content[0];
    vm.dialogLoaded = true;
  }

  vm.refreshField = refreshField;
  vm.setDialogData = setDialogData;
  vm.refreshUrl = '/api/service_dialogs/';

  vm.submitButtonClicked = submitButtonClicked;
  vm.cancelClicked = cancelClicked;
  vm.saveable = saveable;

  function refreshField(field) {
    var idList = {
      dialogId: dialogId,
      resourceActionId: resourceActionId,
      targetId: targetId,
      targetType: targetType
    };

    return dialogFieldRefreshService.refreshField(vm.dialogData, [field.name], vm.refreshUrl, idList);
  }

  function setDialogData(data) {
    vm.dialogData = data.data;
  }

  function submitButtonClicked() {
    vm.dialogData.action = apiAction;
    miqService.sparkleOn();
    var apiData;
    if (apiSubmitEndpoint.match(/generic_objects/)) {
      apiData = {parameters: vm.dialogData};
    } else {
      apiData = vm.dialogData;
    }
    API.post(apiSubmitEndpoint, apiData).then(function() {
      miqService.redirectBack(__('Order Request was Submitted'), 'info', finishSubmitEndpoint);
    }).catch(function(err) {
      miqService.sparkleOff();
      add_flash(__('Error requesting data from server'), 'error');
      console.log(err);
      return Promise.reject(err);
    });
  }

  function cancelClicked(_event) {
    miqService.miqAjaxButton(cancelEndpoint);
  }

  function saveable() {
    return ! dialogFieldRefreshService.areFieldsBeingRefreshed;
  }
}]);
