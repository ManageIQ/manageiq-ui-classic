ManageIQ.angular.app.controller('dialogEditorController', ['API', 'DialogEditor', 'dialogId', function(API, DialogEditor, dialogId) {
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
  }

  function saveFailure() {
  }
}]);
