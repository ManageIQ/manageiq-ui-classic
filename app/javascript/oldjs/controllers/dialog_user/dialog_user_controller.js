ManageIQ.angular.app.controller('dialogUserController', ['API', 'dialogFieldRefreshService', 'miqService', 'dialogUserSubmitErrorHandlerService', 'dialogId', 'apiSubmitEndpoint', 'apiAction', 'finishSubmitEndpoint', 'cancelEndpoint', 'resourceActionId', 'targetId', 'targetType', 'realTargetType', 'openUrl', '$http', '$window', 'dialogReplaceData', 'DialogData', function(API, dialogFieldRefreshService, miqService, dialogUserSubmitErrorHandlerService, dialogId, apiSubmitEndpoint, apiAction, finishSubmitEndpoint, cancelEndpoint, resourceActionId, targetId, targetType, realTargetType, openUrl, $http, $window, dialogReplaceData, DialogData) {
  const vm = this;

  vm.$onInit = function() {
    const apiCall = new Promise((resolve) => {
      const url = `/api/service_dialogs/${dialogId
      }?resource_action_id=${resourceActionId
      }&target_id=${targetId
      }&target_type=${targetType}`;

      resolve(API.get(url, { expand: 'resources', attributes: 'content' }).then(init));
    });

    Promise.resolve(apiCall).then(miqService.refreshSelectpicker);
  };

  function init(dialog) {
    vm.dialog = dialog.content[0];
    vm.dialogLoaded = true;

    _.forEach(vm.dialog.dialog_tabs, (tab) => {
      _.forEach(tab.dialog_groups, (group) => {
        _.forEach(group.dialog_fields, (field) => {
          const replaceField = dialogReplaceData ? JSON.parse(dialogReplaceData).find((replace) => replace.name === field.name) : false;
          if (replaceField) {
            field.default_value = replaceField.value;
          }
          if (field.type === 'DialogFieldDropDownList') {
            _.forEach(field.values, (value) => {
              if (value[0] === null) {
                value[1] = __(value[1]);
              }
            });
          }
        });
      });
    });
  }

  vm.refreshField = refreshField;
  vm.setDialogData = setDialogData;
  vm.openUrl = openUrl;
  vm.targetId = targetId;
  vm.refreshUrl = '/api/service_dialogs/';

  vm.submitButtonClicked = submitButtonClicked;
  vm.cancelClicked = cancelClicked;
  vm.saveable = saveable;
  vm.isValid = false;

  function refreshField(field) {
    console.log('111=', field);
    // API.post(field.href).then((data) => {
    //   console.log(data);
    // });
    const idList = {
      dialogId,
      resourceActionId,
      targetId,
      targetType,
      realTargetType,
    };

    return dialogFieldRefreshService.refreshField(vm.dialogData, [field.name], vm.refreshUrl, idList);
  }

  function setDialogData(data) {
    vm.isValid = data.validations.isValid;
    vm.dialogData = data.data;
  }

  function submitButtonClicked() {
    vm.dialogData.action = apiAction;
    // miqService.sparkleOn();

    let apiData = DialogData.outputConversion(vm.dialogData);
    if (apiSubmitEndpoint.match(/generic_objects/)) {
      apiData = { action: apiAction, parameters: _.omit(apiData, 'action') };
    } else if (apiAction === 'reconfigure') {
      apiData = { action: apiAction, resource: _.omit(apiData, 'action') };
    }

    return API.post(apiSubmitEndpoint, apiData, { skipErrors: [400] })
      .then((response) => {
        if (vm.openUrl === 'true') {
          return API.wait_for_task(response.task_id)
            .then(() => {
              console.log(API.wait_for_task(response.task_id));
              return $http.post('open_url_after_dialog', { targetId: vm.targetId, realTargetType });
            })
            .then((response) => {
              if (response.data.open_url) {
                $window.open(response.data.open_url);
                miqService.redirectBack(__('Order Request was Submitted'), 'success', finishSubmitEndpoint);
              } else {
                miqService.miqFlash('error', __('Automate failed to obtain URL.'));
                miqService.sparkleOff();
              }
            })
            .catch(() => Promise.reject({ data: { error: { message: '-'.concat(__('Automate failed to obtain URL.')) } } }));
        }
        miqService.redirectBack(__('Order Request was Submitted'), 'success', finishSubmitEndpoint);
      })
      .catch((err) => {
        dialogUserSubmitErrorHandlerService.handleError(err);
      });
  }

  function cancelClicked(_event) {
    miqService.redirectBack(__('Dialog Cancelled'), 'info', cancelEndpoint);
  }

  function saveable() {
    return vm.isValid && !dialogFieldRefreshService.areFieldsBeingRefreshed;
  }
}]);
