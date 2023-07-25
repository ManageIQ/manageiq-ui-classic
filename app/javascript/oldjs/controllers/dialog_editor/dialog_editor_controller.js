ManageIQ.angular.app.controller('dialogEditorController', ['$window', 'miqService', 'DialogEditor', 'DialogEditorHttp', 'DialogValidation', 'dialogIdAction', 'automationKeys', 'emsWorkflowsEnabled', function($window, miqService, DialogEditor, DialogEditorHttp, DialogValidation, dialogIdAction, automationKeys, emsWorkflowsEnabled) {
  var vm = this;

  vm.saveButtonDisabled = false;
  vm.saveDialogDetails = saveDialogDetails;
  vm.dismissChanges = dismissChanges;

  // options for tree selector
  vm.treeOptions = {
    load: DialogEditorHttp.treeSelectorLoadData,
    lazyLoad: DialogEditorHttp.treeSelectorLazyLoadData,
    loadAvailableWorkflows: DialogEditorHttp.loadAvailableWorkflows,
    loadWorkflow: DialogEditorHttp.loadWorkflow,
    emsWorkflowsEnabled,
  };

  vm.dropDownEntryPoints = requestAutomationKeys();

  function requestDialogId() {
    return JSON.parse(dialogIdAction).id;
  }

  function requestDialogAction() {
    return JSON.parse(dialogIdAction).action;
  }

  /** Function to get the automation_keys from editor.html.haml which gets the values from AutomationMixin */
  function requestAutomationKeys() {
    return JSON.parse(automationKeys);
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

    /** Function to set the automation_type as 'embedded_automate' / 'embedded_workflow'.
     * Also deletes few attributes from resource_action based on the selected automation_type.
    */
    function setAutomationFields(field) {
      const { automate, workflow } = vm.dropDownEntryPoints;
      const automationFields = field.resource_action.configuration_script_id
        ? { automationType: workflow.key, resetFields: automate.fields }
        : { automationType: automate.key, resetFields: workflow.fields };

      field.automation_type = automationFields.automationType;
      automationFields.resetFields.forEach((item) => {
        if (field.resource_action.hasOwnProperty(item)) {
          delete field.resource_action[item];
        }
      });
    }

    function translateResponderNamesToIds(dialog) {
      var dynamicFields = [];
      var allFields = [];

      _.forEach(dialog.dialog_tabs, function(tab) {
        _.forEach(tab.dialog_groups, function(group) {
          _.forEach(group.dialog_fields, function(field) {
            setAutomationFields(field);
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

    function clearOriginalIds(dialog) {
      _.forEach(dialog.dialog_tabs, function(tab) {
        _.forEach(tab.dialog_groups, function(group) {
          _.forEach(group.dialog_fields, function(field) {
            delete field.dialog_group_id;
          });
          delete group.dialog_tab_id;
        });
        delete tab.dialog_id;
      });
      delete dialog.id;
    }

    translateResponderNamesToIds(dialog.content[0]);

    if (requestDialogAction() === 'copy') {
      // gettext left out intentionally
      // the label will be rendered to all users in all locales as it was saved
      dialog.label = dialog.content[0].label = "Copy of " + dialog.label;

      // otherwise we attempt to create tabs referencing the original dialog, etc.
      clearOriginalIds(dialog.content[0]);
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
      const dialogTabs = _.cloneDeepWith(DialogEditor.getDialogTabs(), customizer);
      dialogData.content.dialog_tabs = reconfigureDialogTabs(dialogTabs);
    } else {
      action = 'create';
      dialogId = '';
      dialogData = {
        description: DialogEditor.getDialogDescription(),
        label: DialogEditor.getDialogLabel(),
        buttons: 'submit,cancel',
        dialog_tabs: [],
      };
      const dialogTabs = _.cloneDeepWith(DialogEditor.getDialogTabs(), customizer);
      dialogData.dialog_tabs = reconfigureDialogTabs(dialogTabs);
    }

    DialogEditorHttp.saveDialog(dialogId, action, dialogData).then(saveSuccess, saveFailure);
  }

  /** Fnuction to remove the automation_type and workflow_name attributes from field's resource_action
   * as they are not required to be processed in backend. */
  function reconfigureDialogTabs(dialogTabs) {
    dialogTabs.forEach((tab) => {
      tab.dialog_groups.forEach((group) => {
        group.dialog_fields.forEach((field) => {
          if (field.hasOwnProperty('automation_type')) {
            delete field.automation_type;
          }
          if (field.resource_action.hasOwnProperty('workflow_name')) {
            delete field.resource_action.workflow_name;
          }
        });
      });
    });
    return dialogTabs;
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
