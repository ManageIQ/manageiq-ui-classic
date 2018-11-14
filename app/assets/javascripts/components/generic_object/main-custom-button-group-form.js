ManageIQ.angular.app.component('mainCustomButtonGroupForm', {
  bindings: {
    genericObjectDefnRecordId: '@?',
    customButtonGroupRecordId: '@?',
    redirectUrl: '@',
  },
  controllerAs: 'vm',
  controller: mainCustomButtonGroupFormController,
  templateUrl: '/static/generic_object/main_custom_button_group_form.html.haml',
});

mainCustomButtonGroupFormController.$inject = ['API', 'miqService', '$http'];

function mainCustomButtonGroupFormController(API, miqService, $http) {
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
      assigned_buttons: [],
      unassigned_buttons: [],
    };

    $http.get('/generic_object_definition/custom_buttons_in_set/?custom_button_set_id=' + vm.customButtonGroupRecordId + '&generic_object_definition_id=' + vm.genericObjectDefnRecordId)
      .then(function(response) {
        Object.assign(vm.customButtonGroupModel, response.data);
        if (vm.customButtonGroupRecordId) {
          vm.newRecord = false;
          miqService.sparkleOn();
          API.get('/api/custom_button_sets/' + vm.customButtonGroupRecordId)
            .then(getCustomButtonGroupFormData)
            .catch(miqService.handleFailure);
        } else {
          vm.newRecord = true;

          API.get('/api/custom_button_sets?expand=resources&attributes=set_data')
            .then(getCustomButtonSetGroupIndex)
            .catch(miqService.handleFailure);
        }
      })
      .catch(miqService.handleFailure);
  };

  vm.updateButtons = function(assignedButtons, unassignedButtons) {
    vm.customButtonGroupModel.assigned_buttons = assignedButtons;
    vm.customButtonGroupModel.unassigned_buttons = unassignedButtons;
  };

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    if (vm.newRecord) {
      miqService.redirectBack(sprintf(__('Creation of new %s was canceled by the user.'), vm.entity), 'warning', vm.redirectUrl);
    } else {
      miqService.redirectBack(sprintf(__('Edit of %s "%s" was canceled by the user.'), vm.entity, vm.customButtonGroupModel.name), 'warning', vm.redirectUrl);
    }
  };

  vm.resetClicked = function(angularForm) {
    vm.customButtonGroupModel = Object.assign({}, vm.modelCopy);

    angularForm.$setUntouched(true);
    angularForm.$setPristine(true);

    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.saveClicked = function() {
    var saveMsg = sprintf(__('%s "%s" has been successfully saved.'), vm.entity, vm.customButtonGroupModel.name);
    vm.saveWithAPI('put', '/api/custom_button_sets/' + vm.customButtonGroupRecordId, vm.prepSaveObject(), saveMsg);
  };

  vm.addClicked = function() {
    var saveMsg = sprintf(__('%s "%s" has been successfully added.'), vm.entity, vm.customButtonGroupModel.name);
    vm.saveWithAPI('post', '/api/custom_button_sets/', vm.prepSaveObject(), saveMsg);
  };

  vm.buttonOrder = function() {
    var orderedButtons = [];
    vm.customButtonGroupModel.assigned_buttons.forEach(function(button) {
      orderedButtons.push(button.id);
    });
    return orderedButtons;
  };

  vm.prepSaveObject = function() {
    vm.customButtonGroupModel.set_data = {
      button_icon: vm.customButtonGroupModel.button_icon,
      button_color: vm.customButtonGroupModel.button_color,
      button_order: vm.buttonOrder(),
      display: vm.customButtonGroupModel.display,
      applies_to_class: 'GenericObjectDefinition',
      applies_to_id: parseInt(vm.genericObjectDefnRecordId, 10),
      group_index: vm.customButtonGroupModel.group_index,
    };

    return {
      name: vm.customButtonGroupModel.name,
      description: vm.customButtonGroupModel.description,
      set_data: vm.customButtonGroupModel.set_data,
      owner_type: 'GenericObjectDefinition',
      owner_id: vm.genericObjectDefnRecordId,
    };
  };

  vm.saveWithAPI = function(method, url, saveObject, saveMsg) {
    miqService.sparkleOn();
    API[method](url, saveObject)
    // TODO remove once API supports adding/removing buttons from button set
      .then( function() {
        $http.post('/generic_object_definition/add_custom_buttons_in_set',{custom_button_set_id: vm.customButtonGroupRecordId, assigned_custom_buttons: vm.customButtonGroupModel.assigned_buttons})
          .then(function() {
            miqService.redirectBack(saveMsg, 'success', vm.redirectUrl);
          })
          .catch(miqService.handleFailure)
      })
      .catch(miqService.handleFailure);
  };

  // private functions
  function getCustomButtonGroupFormData(response) {
    Object.assign(vm.customButtonGroupModel, response);

    vm.customButtonGroupModel.button_icon = response.set_data.button_icon;
    vm.customButtonGroupModel.button_color = response.set_data.button_color;
    vm.customButtonGroupModel.button_order = response.set_data.button_order;
    vm.customButtonGroupModel.display = response.set_data.display;
    vm.customButtonGroupModel.group_index = response.set_data.group_index;

    vm.genericObjectDefnRecordId = response.set_data.applies_to_id;

    vm.customButtonGroupModel.set_data = {};

    vm.modelCopy = Object.assign({}, vm.customButtonGroupModel);
    vm.afterGet = true;
    miqService.sparkleOff();
  }

  function getCustomButtonSetGroupIndex(response) {
    vm.afterGet = true;
    var currentGroupIndex = _.filter(_.map(response.resources, 'set_data'), function(setData) {
      return setData.applies_to_class === 'GenericObject';
    }).length;
    vm.customButtonGroupModel.group_index = currentGroupIndex + 1;
    vm.modelCopy = angular.copy( vm.customButtonGroupModel );
  }
}
