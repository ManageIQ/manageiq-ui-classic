export function MiqDialogEditorController($window, miqService, DialogEditor, DialogEditorHttp, DialogValidation) {
  const vm = this;

  vm.saveButtonDisabled = false;
  vm.saveDialogDetails = saveDialogDetails;
  vm.dismissChanges = dismissChanges;

  // options for tree selector
  vm.treeOptions = {
    load: DialogEditorHttp.treeSelectorLoadData,
    lazyLoad: DialogEditorHttp.treeSelectorLazyLoadData,
  };

  vm.$onInit = () => {
    if (vm.dialogAction === 'new') {
      const dialogInitContent = {
        content: [{
          dialog_tabs: [{
            label: __('New tab'),
            position: 0,
            dialog_groups: [{
              label: __('New section'),
              position: 0,
              dialog_fields: [],
            }],
          }],
        }],
      };
      init(dialogInitContent);
    } else {
      DialogEditorHttp.loadDialog(vm.dialogId).then(init);
    }
  };

  function init(dialog) {
    const sessionStorageId = vm.dialogAction === 'edit' ? String(vm.dialogId) : 'new';
    const restoredDialog = DialogEditor.restoreSessionStorage(sessionStorageId);

    if (restoredDialog !== null) {
      // eslint-disable-next-line no-alert, no-restricted-globals
      if (confirm(__('Restore previous changes?'))) {
        // eslint-disable-next-line no-param-reassign
        dialog = _.cloneDeepWith(restoredDialog, customizer);
        dialog.id = restoredDialog.id;
        dialog.content[0].id = restoredDialog.content[0].id;
      } else {
        DialogEditor.clearSessionStorage(sessionStorageId);
      }
    }

    function translateResponderNamesToIds(dialog) {
      dialog.dialog_tabs.forEach((tab) => {
        tab.dialog_groups.forEach((group) => {
          group.dialog_fields.forEach((field) => {
            // try to translate default value label
            field.values.forEach((value) => {
              if (value[0] === null) {
                value[1] = __(value[1]);
              }
            });
          });
        });
      });
    }

    function clearOriginalIds(dialog) {
      dialog.dialog_tabs.forEach((tab) => {
        tab.dialog_groups.forEach((group) => {
          group.dialog_fields.forEach((field) => {
            delete field.dialog_group_id;
          });
          delete group.dialog_tab_id;
        });
        delete tab.dialog_id;
      });
      delete dialog.id;
    }

    translateResponderNamesToIds(dialog.content[0]);

    if (vm.dialogAction === 'copy') {
      // gettext left out intentionally
      // the label will be rendered to all users in all locales as it was saved
      const label = `Copy of ${dialog.label}`;
      dialog.label = label;
      dialog.content[0].label = label;

      // otherwise we attempt to create tabs referencing the original dialog, etc.
      clearOriginalIds(dialog.content[0]);
    }

    DialogEditor.setData(dialog);
    vm.dialog = dialog;
    vm.DialogValidation = DialogValidation;
    vm.DialogEditor = DialogEditor;
    DialogEditor.backupSessionStorage(sessionStorageId, vm.dialog);
  }

  let beingCloned = null; // hack that solves recursion problem for cloneDeepWith
  function customizer(value) {
    const keysToDelete = ['active', '$$hashKey', 'href', 'dynamicFieldList', 'id'];
    const useCustomizer = (value !== beingCloned) && _.isObject(value) && keysToDelete.some((key) => key in value);

    if (!useCustomizer) {
      return undefined;
    }

    beingCloned = value;
    const copy = _.cloneDeepWith(value, customizer);
    beingCloned = null;

    // remove unnecessary attributes
    keysToDelete.forEach((key) => delete copy[key]);
    return copy;
  }

  function saveDialogDetails() {
    let action;
    let dialogData;
    let dialogId;

    vm.saveButtonDisabled = true;

    // load dialog data
    if (vm.dialogAction === 'edit') {
      action = 'edit';
      dialogId = DialogEditor.getDialogId();
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
    // eslint-disable-next-line no-alert, no-restricted-globals
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
    miqService.miqFlash('error', __('There was an error editing this dialog: ') + response.data.error.message);
  }

  // FIXME: @himdel: method copied from other place -> maybe extract somewhere?
  function getBack(message, warning, error) {
    const url = '/miq_ae_customization/explorer';
    const flash = { message };

    if (warning) {
      flash.level = 'warning';
    } else if (error) {
      flash.level = 'error';
    }

    miqService.miqFlashLater(flash);
    $window.location.href = url;
  }
}

MiqDialogEditorController.$inject = ['$window', 'miqService', 'DialogEditor', 'DialogEditorHttp', 'DialogValidation'];
