ManageIQ.angular.app.controller('dialogEditorController', ['$window', 'miqService', 'DialogEditor', 'DialogEditorHttp', 'DialogValidation', 'dialogIdAction', function($window, miqService, DialogEditor, DialogEditorHttp, DialogValidation, dialogIdAction) {
  var vm = this;

  vm.saveButtonDisabled = false;
  vm.saveDialogDetails = saveDialogDetails;
  vm.dismissChanges = dismissChanges;

  // options for tree selector
  vm.treeOptions = {
    load: DialogEditorHttp.treeSelectorLoadData,
    lazyLoad: DialogEditorHttp.treeSelectorLazyLoadData,
  };

  function requestDialogId() {
    return JSON.parse(dialogIdAction).id;
  }

  function requestDialogAction() {
    return JSON.parse(dialogIdAction).action;
  }

  if (requestDialogAction() === 'new') {
    var dialogInitContent = {
      'content': [{
        'dialog_tabs': [{
          'label': __('New tab'),
          'position': 0,
          'dialog_groups': [{
            'label': __('New section'),
            'position': 0,
            'dialog_fields': [],
          }],
        }],
      }],
    };
    init(dialogInitContent);
  } else {
    DialogEditorHttp.loadDialog(requestDialogId()).then(init);
  }

  function init(dialog) {

    var sessionStorageId = requestDialogAction() === 'edit' ?
      String(requestDialogId()) : 'new'
    var restoredDialog = DialogEditor.restoreSessionStorage(sessionStorageId);
    if (restoredDialog !== null ) {
      if (confirm(__('Restore previous changes?'))) {
        dialog = _.cloneDeepWith(restoredDialog, customizer);
        dialog.id = restoredDialog.id
        dialog.content[0].id = restoredDialog.content[0].id
      } else {
        DialogEditor.clearSessionStorage(sessionStorageId);
      }
    }

    function translateResponderNamesToIds(dialog) {
      var dynamicFields = [];
      var allFields = [];

      _.forEach(dialog.dialog_tabs, function(tab) {
        _.forEach(tab.dialog_groups, function(group) {
          _.forEach(group.dialog_fields, function(field) {
            if (field.dynamic === true) {
              dynamicFields.push(field);
            }
            _.forEach(field.values, function(value) {
              if (value[0] === null) {
                value[1] = __(value[1]);
              }
            });

            allFields.push(field);
          });
        });
      });
    }

    translateResponderNamesToIds(dialog.content[0]);

    if (requestDialogAction() === 'copy') {
      // gettext left out intentionally
      // the label will be rendered to all users in all locales as it was saved
      dialog.label = dialog.content[0].label = "Copy of " + dialog.label;
    }

    DialogEditor.setData(dialog);
    vm.dialog = dialog;
    vm.DialogValidation = DialogValidation;
    vm.DialogEditor = DialogEditor;
    DialogEditor.backupSessionStorage(sessionStorageId, vm.dialog);
  }

  var beingCloned = null; // hack that solves recursion problem for cloneDeepWith
  function customizer(value) {
    var keysToDelete = ['active', '$$hashKey', 'href', 'dynamicFieldList', 'id'];
    var useCustomizer =
      (value !== beingCloned) &&
      _.isObject(value) &&
      keysToDelete.some(function(key) {
        return key in value;
      });

    if (!useCustomizer) {
      return undefined;
    }

    beingCloned = value;
    var copy = _.cloneDeepWith(value, customizer);
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

    vm.saveButtonDisabled = true;

    // load dialog data
    if (requestDialogAction() === 'edit') {
      action = 'edit';
      dialogId = '/' + DialogEditor.getDialogId();
      dialogData = {
        description: DialogEditor.getDialogDescription(),
        label: DialogEditor.getDialogLabel(),
        content: {
          dialog_tabs: [],
        },
      };
      dialogData.content.dialog_tabs = _.cloneDeepWith(DialogEditor.getDialogTabs(), customizer);
    } else {
      action = 'create';
      dialogId = '';
      dialogData = {
        description: DialogEditor.getDialogDescription(),
        label: DialogEditor.getDialogLabel(),
        buttons: 'submit,cancel',
        dialog_tabs: [],
      };
      dialogData.dialog_tabs = _.cloneDeepWith(DialogEditor.getDialogTabs(), customizer);
    }

    DialogEditorHttp.saveDialog(dialogId, action, dialogData).then(saveSuccess, saveFailure);
  }

  function dismissChanges() {
    if (confirm(__('Abandon changes?'))) {
      DialogEditor.clearSessionStorage(DialogEditor.getDialogId());
    } else {
      return;
    }
    getBack(__('Dialog editing was canceled by the user.'), true);
  }

  function saveSuccess() {
    DialogEditor.clearSessionStorage(DialogEditor.getDialogId());
    getBack(vm.dialog.content[0].label + __(' was saved'), false, false);
  }

  function saveFailure(response) {
    vm.saveButtonDisabled = false;
    miqService.miqFlash(
      'error',
      __('There was an error editing this dialog: ') + response.data.error.message
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
