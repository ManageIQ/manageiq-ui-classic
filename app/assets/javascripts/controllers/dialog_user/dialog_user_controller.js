ManageIQ.angular.app.controller('dialogUserController', ['API', 'dialogFieldRefreshService', 'miqService', 'dialogUserSubmitErrorHandlerService', 'dialogId', 'apiSubmitEndpoint', 'apiAction', 'finishSubmitEndpoint', 'cancelEndpoint', 'resourceActionId', 'targetId', 'targetType', 'openUrl', '$http', '$window', function(API, dialogFieldRefreshService, miqService, dialogUserSubmitErrorHandlerService, dialogId, apiSubmitEndpoint, apiAction, finishSubmitEndpoint, cancelEndpoint, resourceActionId, targetId, targetType, openUrl, $http, $window) {
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

    _.forEach(vm.dialog.dialog_tabs, function(tab) {
      _.forEach(tab.dialog_groups, function(group) {
        _.forEach(group.dialog_fields, function(field) {
          if (field.type === 'DialogFieldDropDownList') {
            _.forEach(field.values, function(value) {
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
    var idList = {
      dialogId: dialogId,
      resourceActionId: resourceActionId,
      targetId: targetId,
      targetType: targetType,
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
    return API.post(apiSubmitEndpoint, apiData, {skipErrors: [400]})
      .then(function(response) {
        if (vm.openUrl === 'true') {
          return API.wait_for_task(response.task_id)
            .then(function() {
              return $http.post('open_url_after_dialog', {targetId: vm.targetId});
            })
            .then(function(response) {
              if (response.data.open_url) {
                $window.open(response.data.open_url);
                miqService.redirectBack(__('Order Request was Submitted'), 'success', finishSubmitEndpoint);
              } else {
                miqService.miqFlash('error', __('Automate failed to obtain URL.'));
                miqService.sparkleOff();
              }
            })
            .catch(function() {
              return Promise.reject({data: {error: {message: '-'.concat(__('Automate failed to obtain URL.')) }}});
            });
        }
        miqService.redirectBack(__('Order Request was Submitted'), 'success', finishSubmitEndpoint);
      })
      .catch(function(err) {
        dialogUserSubmitErrorHandlerService.handleError(err);
      });
  }

  function cancelClicked(_event) {
    miqService.redirectBack(__('Dialog Cancelled'), 'info', cancelEndpoint);
  }

  function saveable() {
    return vm.isValid && ! dialogFieldRefreshService.areFieldsBeingRefreshed;
  }
}]);
