ManageIQ.angular.app.controller('dialogEditorController', ['$window', 'API', 'miqService', 'DialogEditor', 'dialogId', function($window, API, miqService, DialogEditor, dialogId) {
  var vm = this;

  if (dialogId === 'new') {
    var dialogInitContent = {
      'content': [{
        'dialog_tabs': [{
          'label': 'New tab',
          'position': 0,
          'dialog_groups': [
          ],
        }],
      }],
    };
    init(dialogInitContent);
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

  var beingCloned = null; // hack that solves recursion problem for cloneDeep
  function customizer(value) {
    if ((value !== beingCloned) && _.isObject(value) && (value.href || value.$$hashKey || 'active' in value)) {
      beingCloned = value;
      var copy = _.cloneDeep(value, customizer);
      beingCloned = null;
      // remove unnecessary attributes
      delete copy.href;
      delete copy.active;
      delete copy.$$hashKey;
      return copy;
    } else {
      return undefined;
    }
  }

  function saveDialogDetails() {
    var action
    var dialogData;

    // load dialog data
    if (angular.isUndefined(DialogEditor.getDialogId())) {
      action = 'create';
      dialogData = {
        description: DialogEditor.getDialogDescription(),
        label: DialogEditor.getDialogLabel(),
        dialog_tabs: [],
      };
      dialogData.dialog_tabs = _.cloneDeep(DialogEditor.getDialogTabs(), customizer);
    } else {
      action = 'edit';
      dialogData = {
        description: DialogEditor.getDialogDescription(),
        label: DialogEditor.getDialogLabel(),
        content: {
          dialog_tabs: [],
        },
      };
      // once we start using lodash 4.17.4, change to 'cloneDeepWith'
      // https://lodash.com/docs/4.17.4#cloneDeepWith
      dialogData.content.dialog_tabs = _.cloneDeep(DialogEditor.getDialogTabs(), customizer);
    }
    // save the dialog
    API.post(
      '/api/service_dialogs/'
      + DialogEditor.getDialogId(),
      {action: action, resource: dialogData}
    ).then(saveSuccess, saveFailure);
  }

  function dismissChanges() {
    getBack(__('Dialog editing was canceled by the user.'), true);
  }

  function saveSuccess() {
    getBack(vm.dialog.content[0].label + __(' was saved'), false, false);
  }

  function saveFailure() {
    miqService.miqFlash('error', __('There was an error editing this dialog.'));
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

    miqService.miqFlashLater(flash);
    $window.location.href = url;
  }
}]);
