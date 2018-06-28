ManageIQ.angular.app.controller('dialogUserController', ['API', 'dialogFieldRefreshService', 'miqService', 'dialogUserSubmitErrorHandlerService', 'dialogId', 'apiSubmitEndpoint', 'apiAction', 'finishSubmitEndpoint', 'cancelEndpoint', 'resourceActionId', 'targetId', 'targetType', function(API, dialogFieldRefreshService, miqService, dialogUserSubmitErrorHandlerService, dialogId, apiSubmitEndpoint, apiAction, finishSubmitEndpoint, cancelEndpoint, resourceActionId, targetId, targetType) {
  var vm = this;

  vm.$onInit = function() {
    var apiCall = new Promise(function(resolve) {
      var url = '/api/service_dialogs/' + dialogId +
        '?resource_action_id=' + resourceActionId +
        '&target_id=' + targetId +
        '&target_type=' + targetType;

      resolve(API.get(url, {expand: 'resources', attributes: 'content'}).then(init));
    });

    Promise.resolve(apiCall).then(miqService.refreshSelectpicker);
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
  vm.isValid = false;

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
    vm.isValid = data.validations.isValid;
    vm.dialogData = data.data;
  }

  function submitButtonClicked() {
    vm.dialogData.action = apiAction;
    miqService.sparkleOn();
    var apiData;
    if (apiSubmitEndpoint.match(/generic_objects/)) {
      apiData = {action: apiAction, parameters: _.omit(vm.dialogData, 'action')};
    } else if (apiAction === 'reconfigure') {
      apiData = {action: apiAction, resource: _.omit(vm.dialogData, 'action')};
    } else {
      apiData = vm.dialogData;
    }
    API.post(apiSubmitEndpoint, apiData, {skipErrors: [400]}).then(function() {
      miqService.redirectBack(__('Order Request was Submitted'), 'info', finishSubmitEndpoint);
    }).catch(function(err) {
      return Promise.reject(dialogUserSubmitErrorHandlerService.handleError(err));
    });
  }

  function cancelClicked(_event) {
    miqService.redirectBack(__('Dialog Cancelled'), 'info', cancelEndpoint);
  }

  function saveable() {
    return vm.isValid && ! dialogFieldRefreshService.areFieldsBeingRefreshed;
  }
}]);
