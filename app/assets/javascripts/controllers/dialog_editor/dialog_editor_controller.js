ManageIQ.angular.app.controller('dialogEditorController', ['$window', 'miqService', 'DialogEditor', 'DialogEditorHttp', 'DialogValidation', 'dialogIdAction', function($window, miqService, DialogEditor, DialogEditorHttp, DialogValidation, dialogIdAction) {
  var vm = this;

  vm.saveButtonDisabled = false;
  vm.saveDialogDetails = saveDialogDetails;
  vm.dismissChanges = dismissChanges;

  // treeSelector related
  vm.lazyLoad = DialogEditorHttp.treeSelectorLazyLoadData;
  vm.node = {};
  DialogEditorHttp.treeSelectorLoadData().then(function(data) {
    vm.treeSelectorData = data;
  });

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
            'dialog_fields': []
          }],
        }],
      }],
    };
    init(dialogInitContent);
  } else {
    DialogEditorHttp.loadDialog(requestDialogId()).then(init);
  }

  function init(dialog) {
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
      dialog.label = dialog.content[0].label = "Copy of " + dialog.label;

      // otherwise we attempt to create tabs referencing the original dialog, etc.
      clearOriginalIds(dialog.content[0]);
    }

    DialogEditor.setData(dialog);
    vm.dialog = dialog;
    vm.DialogValidation = DialogValidation;
    vm.DialogEditor = DialogEditor;
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

    if (! useCustomizer) {
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
    getBack(__('Dialog editing was canceled by the user.'), true);
  }

  function saveSuccess() {
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
