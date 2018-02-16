ManageIQ.angular.app.controller('dialogEditorController', ['$window', 'miqService', 'DialogEditor', 'DialogEditorHttp', 'DialogValidation', 'dialogIdAction', function($window, miqService, DialogEditor, DialogEditorHttp, DialogValidation, dialogIdAction) {
  var vm = this;

  vm.saveDialogDetails = saveDialogDetails;
  vm.dismissChanges = dismissChanges;
  vm.setupModalOptions = setupModalOptions;

  // treeSelector related
  vm.lazyLoad = DialogEditorHttp.treeSelectorLazyLoadData;
  vm.onSelect = onSelect;
  vm.showFullyQualifiedName = showFullyQualifiedName;
  vm.node = {};
  vm.treeSelectorToggle = treeSelectorToggle;
  vm.treeSelectorIncludeDomain = false;
  vm.treeSelectorShow = false;
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

  function setupModalOptions(type, tab, box, field) {
    var components = {
      tab: 'dialog-editor-modal-tab',
      box: 'dialog-editor-modal-box',
      field: 'dialog-editor-modal-field'
    };
    vm.modalOptions = {
      component: components[type],
      size: 'lg',
    };
    vm.elementInfo = { type: type, tabId: tab, boxId: box, fieldId: field };
    vm.visible = true;
  }


  function onSelect(node, elementData) {
    var fqname = node.fqname.split('/');
    if (vm.treeSelectorIncludeDomain === false) {
      fqname.splice(1, 1);
    }
    elementData.resource_action.ae_instance = fqname.pop();
    elementData.resource_action.ae_class = fqname.pop();
    elementData.resource_action.ae_namespace = fqname.filter(String).join('/');
    vm.treeSelectorShow = false;
  }

  function showFullyQualifiedName(resourceAction) {
    if (typeof resourceAction.ae_namespace === 'undefined' ||
        typeof resourceAction.ae_class === 'undefined' ||
        typeof resourceAction.ae_instance === 'undefined') {
      return '';
    }
    var fqname = resourceAction.ae_namespace
      + '/' + resourceAction.ae_class
      + '/' + resourceAction.ae_instance;
    return fqname;
  }

  function treeSelectorToggle() {
    vm.treeSelectorShow = ! vm.treeSelectorShow;
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
