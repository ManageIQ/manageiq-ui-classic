ManageIQ.angular.app.controller('dialogUserReconfigureController', ['API', 'dialogFieldRefreshService', 'miqService', 'dialogUserSubmitErrorHandlerService', 'resourceActionId', 'targetId', 'DialogData', function(API, dialogFieldRefreshService, miqService, dialogUserSubmitErrorHandlerService, resourceActionId, targetId, DialogData) {
  const vm = this;

  vm.$onInit = function() {
    const apiCall = new Promise((resolve) => {
      const url = `/api/services/${targetId
      }?attributes=reconfigure_dialog`;

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
    const idList = {
      dialogId: vm.dialogId,
      resourceActionId,
      targetId,
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

    const apiData = {
      action: 'reconfigure',
      resource: _.omit(DialogData.outputConversion(vm.dialogData), 'action'),
    };
    const apiSubmitEndpoint = `/api/services/${targetId}`;

    return API.post(apiSubmitEndpoint, apiData, { skipErrors: [400] }).then(() => {
      miqService.redirectBack(__('Order Request was Submitted'), 'info', '/service');
    }).catch((err) => Promise.reject(dialogUserSubmitErrorHandlerService.handleError(err)));
  }

  function cancelClicked(_event) {
    miqService.redirectBack(__('Dialog Cancelled'), 'info', '/service');
  }

  function saveable() {
    return vm.isValid && !dialogFieldRefreshService.areFieldsBeingRefreshed;
  }
}]);
