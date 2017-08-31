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
  vm.dialogIsValid = dialogIsValid;

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

  function dialogIsValid() {
    var validators = {
      dialog: [
        dialog => ({ status: ! _.isEmpty(dialog.label),
                     errorMessage: __('Dialog needs to have a label') }),
        dialog => ({ status: dialog.dialog_tabs.length > 0,
                     errorMessage: __('Dialog needs to have at least one tab') })
      ],
      tabs: [
        tab => ({ status: ! _.isEmpty(tab.label),
                  errorMessage: __('Dialog tab needs to have a name') }),
        tab => ({ status: tab.dialog_groups.length > 0,
                  errorMessage: __('Dialog tab needs to have at least one box') })
      ],
      groups: [
        group => ({ status: ! _.isEmpty(group.label),
                    errorMessage: __('Dialog box needs to have a name') }),
        group => ({ status: group.dialog_fields.length > 0,
                    errorMessage: __('Dialog box needs to have at least one element') })
      ],
      fields: [
        field => ({ status: ! _.isEmpty(field.name),
                    errorMessage: __('Dialog element needs to have a name') }),
        field => ({ status: ! _.isEmpty(field.label),
                    errorMessage: __('Dialog element needs to have a label') })
      ]
    };

    let invalid = [];
    let validate = function (f, item) {
      let validation = f(item);
      if (!validation.status) {
        invalid.push({ message: validation.errorMessage, item: item });
      }
      return validation.status;
    };

    return _.every(DialogEditor.data.content, dialog =>
      _.every(validators.dialog, f => validate(f, dialog)) &&
      _.every(dialog.dialog_tabs, tab =>
        _.every(validators.tabs, f => validate(f, tab)) &&
        _.every(tab.dialog_groups, group =>
          _.every(validators.groups, f => validate(f, group)) &&
          _.every(group.dialog_fields, field =>
            _.every(validators.fields, f => validate(f, field)))
        )
      )
    );
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
