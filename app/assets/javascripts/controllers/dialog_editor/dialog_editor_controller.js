ManageIQ.angular.app.controller('dialogEditorController', ['$window', 'API', 'miqService', 'DialogEditor', 'dialogId', function($window, API, miqService, DialogEditor, dialogId) {
  var vm = this;

  if (dialogId === 'new') {
    var dialog = {
      'content': [{
        'dialog_tabs': [{
          'label': 'New tab',
          'position': 0,
          'dialog_groups': [
          ],
        }],
      }],
    };
    init(dialog);
  } else {
    API.get(
      '/api/service_dialogs/'
      + dialogId
      + '?attributes=content,buttons,label'
    ).then(init);
  }

  function init(dialog) {
    DialogEditor.setData(dialog);
    vm.dialog = dialog;
  }

  vm.saveDialogDetails = saveDialogDetails;
  vm.dismissChanges = dismissChanges;

  function dismissChanges() {
    getBack(__("Dialog editing was canceled by the user."), true);
  }

  function saveDialogDetails() {
    var action, dialogData;

    // load dialog data
    if (angular.isUndefined(DialogEditor.getDialogId())) {
      action = 'create';
      dialogData = {
        description: DialogEditor.getDialogDescription(),
        label: DialogEditor.getDialogLabel(),
        dialog_tabs: [],
      };
      _.cloneDeep(DialogEditor.getDialogTabs()).forEach(function(tab) {
        delete tab.active;
        dialogData.dialog_tabs.push(tab);
      });
    } else {
      action = 'edit';
      dialogData = {
        description: DialogEditor.getDialogDescription(),
        label: DialogEditor.getDialogLabel(),
        content: {
          dialog_tabs: [],
        },
      };
      _.cloneDeep(DialogEditor.getDialogTabs()).forEach(function(tab) {
        delete tab.active;
        dialogData.content.dialog_tabs.push(tab);
      });
    }
    // save the dialog
    API.post(
      '/api/service_dialogs/'
      + DialogEditor.getDialogId()
      + '?attributes='
      + angular.toJson({action: action, resource: dialogData})
    ).then(saveSuccess, saveFailure);
  }

  function saveSuccess() {
    getBack(vm.dialog.content[0].label + __(' was saved'), false, false);
  }

  function saveFailure() {
    miqService.miqFlash("error", __('There was an error editing this dialog.'));
  }

  // FIXME: @himdel: method copied from other place -> maybe extract somewhere?
  function getBack(message, warning, error) {
    var url = '/miq_ae_customization/explorer';
    var flash = { message: message };

    if (warning) {
      flash.level = 'warning';
    } else if (error) {
      flash.level = 'error';
    }

    miqFlashLater(flash);
    $window.location.href = url;
  }

}]);
