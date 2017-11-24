ManageIQ.angular.app.component('mainCustomButtonGroupFormComponent', {
  bindings: {
    genericObjectDefnRecordId: '@?',
    customButtonGroupRecordId: '@?',
    redirectUrl: '@',
  },
  controllerAs: 'vm',
  controller: mainCustomButtonGroupFormController,
  templateUrl: '/static/generic_object/main_custom_button_group_form.html.haml',
});

mainCustomButtonGroupFormController.$inject = ['API', 'miqService'];

function mainCustomButtonGroupFormController(API, miqService) {
  var vm = this;

  vm.$onInit = function() {
    vm.entity = __('Custom Button Group');
    vm.saveable = miqService.saveable;
    vm.afterGet = false;

    vm.customButtonGroupModel = {
      name: '',
      description: '',
      display: true,
      button_icon: '',
      button_color: '#4d5258',
      set_data: {},
    };

    if (vm.customButtonGroupRecordId) {
      vm.newRecord = false;
      miqService.sparkleOn();
      API.get('/api/custom_button_sets/' + vm.customButtonGroupRecordId)
        .then(getCustomButtonGroupFormData)
        .catch(miqService.handleFailure);
    } else {
      vm.newRecord = true;
      vm.afterGet = true;

      vm.modelCopy = angular.copy( vm.customButtonGroupModel );
    }
  };

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    if (vm.newRecord) {
      miqService.redirectBack(sprintf(__('Creation of new %s was canceled by the user.'), vm.entity), 'warning', vm.redirectUrl);
    } else {
      miqService.redirectBack(sprintf(__('Edit of %s \"%s\" was canceled by the user.'), vm.entity, vm.customButtonGroupModel.name), 'warning', vm.redirectUrl);
    }
  };

  vm.resetClicked = function(angularForm) {
    vm.customButtonGroupModel = Object.assign({}, vm.modelCopy);

    angularForm.$setUntouched(true);
    angularForm.$setPristine(true);

    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.saveClicked = function() {
    var saveMsg = sprintf(__('%s \"%s\" has been successfully saved.'), vm.entity, vm.customButtonGroupModel.name);

    miqService.saveWithAPI('/api/custom_button_sets/' + vm.customButtonGroupRecordId, vm.prepSaveObject(), {
      method: 'put',
      successMessage: saveMsg,
      redirectUrl: vm.redirectUrl,
    });
  };

  vm.addClicked = function() {
    var saveMsg = sprintf(__('%s \"%s\" has been successfully added.'), vm.entity, vm.customButtonGroupModel.name);

    miqService.saveWithAPI('/api/custom_button_sets', vm.prepSaveObject(), {
      method: 'post',
      successMessage: saveMsg,
      redirectUrl: vm.redirectUrl,
    });
  };

  vm.prepSaveObject = function() {
    vm.customButtonGroupModel.set_data = {
      button_icon: vm.customButtonGroupModel.button_icon,
      button_color: vm.customButtonGroupModel.button_color,
      display: vm.customButtonGroupModel.display,
      applies_to_class: 'GenericObjectDefinition',
      applies_to_id: parseInt(vm.genericObjectDefnRecordId, 10),
    };

    return {
      name: vm.customButtonGroupModel.name,
      description: vm.customButtonGroupModel.description,
      set_data: vm.customButtonGroupModel.set_data,
      owner_type: 'GenericObjectDefinition',
      owner_id: vm.genericObjectDefnRecordId,
    };
  };

  // private functions
  function getCustomButtonGroupFormData(response) {
    Object.assign(vm.customButtonGroupModel, response);

    vm.customButtonGroupModel.button_icon = response.set_data.button_icon;
    vm.customButtonGroupModel.button_color = response.set_data.button_color;
    vm.customButtonGroupModel.display = response.set_data.display;

    vm.genericObjectDefnRecordId = response.set_data.applies_to_id;

    vm.customButtonGroupModel.set_data = {};

    vm.modelCopy = Object.assign({}, vm.customButtonGroupModel);
    vm.afterGet = true;
    miqService.sparkleOff();
  }
}
