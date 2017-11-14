ManageIQ.angular.app.controller('dialogEditorController', ['$window', '$http', 'API', 'miqService', 'DialogEditor', 'DialogValidation', 'dialogId', function($window, $http, API, miqService, DialogEditor, DialogValidation, dialogId) {
  var vm = this;

  vm.cache = {};
  vm.$http = $http;

  vm.saveDialogDetails = saveDialogDetails;
  vm.dismissChanges = dismissChanges;
  vm.setupModalOptions = setupModalOptions;

  // treeSelector related
  vm.lazyLoad = lazyLoad;
  vm.onSelect = onSelect;
  vm.showFullyQualifiedName = showFullyQualifiedName;
  vm.node = {};
  vm.treeSelectorToggle = treeSelectorToggle;
  vm.treeSelectorIncludeDomain = false;
  vm.treeSelectorShow = false;
  vm.$http.get('/tree/automate_entrypoint').then(function(response) {
    vm.treeSelectorData = response.data;
  });

  if (dialogId === 'new') {
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
    API.get(
      '/api/service_dialogs/'
      + dialogId
      + '?attributes=content,buttons,label'
    ).then(init);
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

      _.forEach(allFields, function(field) {
        _.forEach(field.dialog_field_responders, function(responder, index) {
          _.forEach(dynamicFields, function(dynamicField) {
            if (responder === dynamicField.name) {
              field.dialog_field_responders[index] = dynamicField.id;
            }
          });
        });
      });
    }

    translateResponderNamesToIds(dialog.content[0]);
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


  function lazyLoad(node) {
    return vm.$http.get('/tree/automate_entrypoint?id=' + encodeURIComponent(node.key))
    .then(function(response) {
      vm.cache[node.key] = response.data;
      return response.data;
    });
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
    if (typeof resourceAction.ae_namespace == 'undefined' ||
        typeof resourceAction.ae_class == 'undefined' ||
        typeof resourceAction.ae_instance == 'undefined') {
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
    var keysToDelete = ['active', '$$hashKey', 'href', 'dynamicFieldList'];
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

    API.post('/api/service_dialogs' + dialogId, {
      action: action,
      resource: dialogData,
    }, { // options - don't show the error modal on validation errors
      skipErrors: [400],
    }).then(saveSuccess, saveFailure);
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
