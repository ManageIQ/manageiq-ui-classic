ManageIQ.angular.app.controller('dialogEditorController', ['$window', 'API', 'miqService', 'DialogEditor', 'dialogId', function($window, API, miqService, DialogEditor, dialogId) {
  var vm = this;

  if (dialogId === 'new') {
    var dialogInitContent = {
      'content': [{
        'dialog_tabs': [{
          'label': 'New tab',
          'position': 0,
          'dialog_groups': [{
            'label': 'New box',
            'position': 0,
            'dialog_fields': []
          }],
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
    var keysToDelete = ['active', '$$hashKey', 'href'];
    var useCustomizer =
      (value !== beingCloned) &&
      _.isObject(value) &&
      keysToDelete.some(function(key) {
        return key in value;
      });

    if (! useCustomizer) {
      return undefined;
    }

    beingCloned = value;
    var copy = _.cloneDeep(value, customizer);
    beingCloned = null;

    // remove unnecessary attributes
    keysToDelete.forEach(function(key) {
      delete copy[key];
    });
    return copy;
  }

  function saveDialogDetails() {
    var action;
    var dialogData;
    var dialogId;

    // load dialog data
    if (angular.isUndefined(DialogEditor.getDialogId())) {
      action = 'create';
      dialogData = {
        description: DialogEditor.getDialogDescription(),
        label: DialogEditor.getDialogLabel(),
        buttons: 'submit, cancel',
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
    if (action === 'create') {
      dialogId = '';
    } else {
      dialogId = '/' + DialogEditor.getDialogId();
    }

    API.post(
      '/api/service_dialogs'
      + dialogId,
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
    miqService.miqFlash(
      'error',
      __('There was an error editing this dialog: ') + arguments[0].error.message
    );
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
