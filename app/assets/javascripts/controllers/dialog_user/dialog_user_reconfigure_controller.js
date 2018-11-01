ManageIQ.angular.app.controller('dialogUserReconfigureController', ['API', 'dialogFieldRefreshService', 'miqService', 'dialogUserSubmitErrorHandlerService', 'resourceActionId', 'targetId', function(API, dialogFieldRefreshService, miqService, dialogUserSubmitErrorHandlerService, resourceActionId, targetId) {
  var vm = this;

  vm.$onInit = function() {
    var apiCall = new Promise(function(resolve) {
      var url = '/api/services/' + targetId +
        '?attributes=reconfigure_dialog';

      resolve(API.get(url).then(init));
    });

    Promise.resolve(apiCall).then(miqService.refreshSelectpicker);
  };

  function init(data) {
    vm.dialogId = data.reconfigure_dialog[0].id;
    vm.dialog = data.reconfigure_dialog[0];
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
      dialogId: vm.dialogId,
      resourceActionId: resourceActionId,
      targetId: targetId,
      targetType: 'service',
    };

    return dialogFieldRefreshService.refreshField(vm.dialogData, [field.name], vm.refreshUrl, idList);
  }

  function setDialogData(data) {
    vm.isValid = data.validations.isValid;
    vm.dialogData = data.data;
  }

  function submitButtonClicked() {
    miqService.sparkleOn();

    var apiData = {action: 'reconfigure', resource: _.omit(vm.dialogData, 'action')};
    var apiSubmitEndpoint = '/api/services/' + targetId;

    return API.post(apiSubmitEndpoint, apiData, {skipErrors: [400]}).then(function() {
      miqService.redirectBack(__('Order Request was Submitted'), 'info', '/service/explorer');
    }).catch(function(err) {
      return Promise.reject(dialogUserSubmitErrorHandlerService.handleError(err));
    });
  }

  function cancelClicked(_event) {
    miqService.redirectBack(__('Dialog Cancelled'), 'info', '/service/explorer');
  }

  function saveable() {
    return vm.isValid && ! dialogFieldRefreshService.areFieldsBeingRefreshed;
  }
}]);
