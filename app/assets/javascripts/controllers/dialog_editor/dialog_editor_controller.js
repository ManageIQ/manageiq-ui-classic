ManageIQ.angular.app.controller('dialogEditorController', ['$window', 'miqService', 'DialogEditor', 'DialogEditorHttp', 'DialogValidation', 'dialogIdAction', function($window, miqService, DialogEditor, DialogEditorHttp, DialogValidation, dialogIdAction) {
  var vm = this;

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

            allFields.push(field);
          });
        });
      });
    }

    translateResponderNamesToIds(dialog.content[0]);

    if (requestDialogAction() === 'copy') {
      dialog.label = dialog.content[0].label = "Copy of " + dialog.label;
    }

    DialogEditor.setData(dialog);
    vm.dialog = dialog;
    vm.DialogValidation = DialogValidation;
    vm.DialogEditor = DialogEditor;
  }

  var beingCloned = null; // hack that solves recursion problem for cloneDeep
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
      // once we start using lodash 4.17.4, change to 'cloneDeepWith'
      // https://lodash.com/docs/4.17.4#cloneDeepWith
      dialogData.content.dialog_tabs = _.cloneDeep(DialogEditor.getDialogTabs(), customizer);
    } else {
      action = 'create';
      dialogId = '';
      dialogData = {
        description: DialogEditor.getDialogDescription(),
        label: DialogEditor.getDialogLabel(),
        buttons: 'submit,cancel',
        dialog_tabs: [],
      };
      dialogData.dialog_tabs = _.cloneDeep(DialogEditor.getDialogTabs(), customizer);
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
