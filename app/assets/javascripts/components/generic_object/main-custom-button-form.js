ManageIQ.angular.app.component('mainCustomButtonForm', {
  bindings: {
    genericObjectDefinitionRecordId: '@?',
    customButtonGroupRecordId: '@?',
    customButtonRecordId: '@?',
    redirectUrl: '@',
  },
  controllerAs: 'vm',
  controller: mainCustomButtonFormController,
  templateUrl: '/static/generic_object/main_custom_button_form.html.haml',
});

mainCustomButtonFormController.$inject = ['API', 'miqService', '$q', '$http'];

function mainCustomButtonFormController(API, miqService, $q, $http) {
  var vm = this;

  vm.$onInit = function() {
    vm.entity = __('Custom Button');
    vm.saveable = miqService.saveable;
    vm.afterGet = false;

    vm.customButtonModel = {
      button_type: 'default',
      name: '',
      description: '',
      display: true,
      button_icon: '',
      button_color: '#4d5258',
      options: {},
      resource_action: {},
      visibility: {},
      dialog_id: undefined,
      display_for: 'single',
      submit_how: 'one',
      ae_instance: 'Request',
      ae_message: 'create',
      request: '',
      roles: ['_ALL_'],
      attribute_names: [],
      attribute_values: [],
      attributeValuesTableChanged: false,
      current_visibility: 'all',
      available_roles: [],
      uri_attributes: {"request": "", service_template: null, hosts: null},
    };

    vm.dialogs = [];
    vm.button_types = [];
    vm.ae_instances = [];
    vm.templates = [];
    vm.inventory = 'localhost';

    vm.attributeValueTableHeaders = [__('Name'), __('Value'), __('Actions')];

    vm.display_for = [
      {id: 'single', name: __('Single Entity')},
      {id: 'list', name: __('List')},
      {id: 'both', name: __('Single and List')},
    ];

    vm.submit_how = [
      {id: 'all', name: __('Submit all')},
      {id: 'one', name: __('One by one')},
    ];

    vm.visibilities = [
      {id: 'all', name: '<' + __('To All') + '>'},
      {id: 'role', name: '<' + __('By Role') + '>'},
    ];

    miqService.sparkleOn();
    var optionsPromise = API.options('/api/custom_buttons')
      .then(function(response) {
        _.forEach(response.data.custom_button_types, function(name, id) {
          vm.button_types.push({id: id, name: name});
        });
      });
    var dataPromise;
    if (vm.customButtonRecordId) {
      vm.newRecord = false;
      dataPromise = API.get('/api/custom_buttons/' + vm.customButtonRecordId + '?attributes=resource_action,uri_attributes')
        .then(getCustomButtonFormData)
        .catch(miqService.handleFailure);
    } else {
      vm.newRecord = true;
      vm.modelCopy = angular.copy( vm.customButtonModel );
    }

    var serviceDialogsPromise = API.get('/api/service_dialogs?expand=resources&attributes=label')
      .then(function(response) {
        _.forEach(response.resources, function(item) {
          vm.dialogs.push({id: item.id, label: item.label});
        });
      });

    var rolesPromise = API.get('/api/roles?expand=resources&attributes=name')
      .then(function(response) {
        _.forEach(response.resources, function(item) {
          vm.customButtonModel.available_roles.push({name: item.name, value: false});
        });
      });

    var instancesPromise = $http.get('/generic_object_definition/retrieve_distinct_instances_across_domains')
      .then(function(response) {
        _.forEach(response.data.distinct_instances_across_domains, function(item) {
          vm.ae_instances.push({id: item, name: item});
        });
      });

    var serviceTemplateAnsiblePlaybooks = $http.get('/generic_object_definition/service_template_ansible_playbooks')
      .then(function(response) {
        vm.templates = response.data.templates;
      });

    $q.all([optionsPromise, dataPromise, serviceDialogsPromise, rolesPromise, instancesPromise, serviceTemplateAnsiblePlaybooks])
      .then(function() {
        vm.afterGet = true;
        miqService.sparkleOff();
      })
      .catch(miqService.handleFailure);
  };

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    if (vm.newRecord) {
      miqService.redirectBack(sprintf(__('Creation of new %s was canceled by the user.'), vm.entity), 'warning', vm.redirectUrl);
    } else {
      miqService.redirectBack(sprintf(__('Edit of %s "%s" was canceled by the user.'), vm.entity, vm.customButtonModel.name), 'warning', vm.redirectUrl);
    }
  };

  vm.resetClicked = function(angularForm) {
    vm.customButtonModel = angular.extend({}, vm.modelCopy);

    vm.customButtonModel.attribute_values = Object.values(vm.customButtonModel.resource_action.ae_attributes);
    vm.customButtonModel.attribute_names = Object.keys(vm.customButtonModel.resource_action.ae_attributes);
    vm.customButtonModel.noOfAttributeValueRows = vm.customButtonModel.attribute_names.length;

    vm.modelCopy = angular.extend({}, vm.customButtonModel);

    angularForm.$setUntouched(true);
    angularForm.$setPristine(true);

    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.saveClicked = function() {
    miqService.sparkleOn();
    miqService.miqFlashClear(); // remove previous messages
    var saveMsg = sprintf(__('%s "%s" has been successfully saved.'), vm.entity, vm.customButtonModel.name);
    return API.put('/api/custom_buttons/' + vm.customButtonRecordId, vm.prepSaveObject(), {skipErrors: [400]})
      .then(function() {
        miqService.redirectBack(saveMsg, 'success', vm.redirectUrl);
      })
      .catch(handleErrorMessages);
  };

  vm.addClicked = function() {
    miqService.sparkleOn();
    miqService.miqFlashClear(); // remove previous messages
    var saveMsg = sprintf(__('%s "%s" has been successfully added.'), vm.entity, vm.customButtonModel.name);
    return API.post('/api/custom_buttons/', vm.prepSaveObject(), {skipErrors: [400]})
      .then(function(response) {
        if (vm.customButtonGroupRecordId) {
          var saveMsgBtnInGrp = sprintf(__('%s "%s" has been successfully added under the selected button group.'), vm.entity, vm.customButtonModel.name);
          return $http.post('/generic_object_definition/add_button_in_group/' + vm.customButtonGroupRecordId + '?button_id=' + response.results[0].id)
            .then(function() {
              miqService.redirectBack(saveMsgBtnInGrp, 'success', vm.redirectUrl);
            })
            .catch(miqService.handleFailure);
        } else {
          miqService.redirectBack(saveMsg, 'success', vm.redirectUrl);
        }
      })
      .catch(handleErrorMessages);
  };

  vm.prepSaveObject = function() {
    vm.customButtonModel.options = {};
    vm.customButtonModel.resource_action = {};
    vm.customButtonModel.visibility = {};

    vm.customButtonModel.options = {
      button_icon: vm.customButtonModel.button_icon,
      button_color: vm.customButtonModel.button_color,
      button_type: vm.customButtonModel.button_type,
      display: vm.customButtonModel.display,
      display_for: vm.customButtonModel.display_for,
      submit_how: vm.customButtonModel.submit_how,
    };

    Object.assign(vm.customButtonModel.uri_attributes, _.zipObject(
      vm.customButtonModel.attribute_names,
      vm.customButtonModel.attribute_values));
    vm.customButtonModel.uri_attributes.request = vm.customButtonModel.request;

    vm.customButtonModel.resource_action = {
      id : vm.customButtonModel.resource_id,
      dialog_id: vm.customButtonModel.dialog_id,
      ae_namespace: 'SYSTEM',
      ae_class: 'PROCESS',
      ae_instance: vm.customButtonModel.ae_instance,
      ae_message: vm.customButtonModel.ae_message,
    };

    if (vm.customButtonModel.current_visibility === 'role') {
      vm.customButtonModel.roles = _.map(_.filter(vm.customButtonModel.available_roles, function(role) {
        return role.value === true;
      }), 'name');
    }
    // set uri_attributes to default for non-Ansible button
    if (vm.customButtonModel.button_type === "default") {
      Object.assign(vm.customButtonModel.uri_attributes, {"request": vm.customButtonModel.request, service_template: null, hosts: null});
    };

    vm.customButtonModel.visibility = {
      roles: vm.customButtonModel.roles.length === 0 ? ['_ALL_'] : vm.customButtonModel.roles,
    };

    return {
      name: vm.customButtonModel.name,
      description: vm.customButtonModel.description,
      applies_to_class: 'GenericObjectDefinition',
      applies_to_id: vm.genericObjectDefinitionRecordId,
      options: vm.customButtonModel.options,
      resource_action: vm.customButtonModel.resource_action,
      visibility: vm.customButtonModel.visibility,
      uri_attributes: vm.customButtonModel.uri_attributes,
    };
  };

  // private functions
  function handleErrorMessages(error) {
    miqSparkleOff();
    if (error.status === 400) {
      var errorMessages = error.data.error.message.split(',');
      errorMessages.forEach(function(message) {
        if (message.includes("Name has already been taken")) {
          add_flash(__("Name has already been taken"), "error");
          return Promise.reject();
        } else if (message.includes("Description has already been taken")) {
          add_flash(__("Description has already been taken"), "error");
          return Promise.reject();
        } else {
          return miqService.handleFailure();
        }
      });
    } else {
      return miqService.handleFailure();
    }
  }

  function getCustomButtonFormData(response) {
    Object.assign(vm.customButtonModel, response);

    vm.customButtonModel.button_icon = response.options.button_icon;
    vm.customButtonModel.button_color = response.options.button_color;
    vm.customButtonModel.button_type = response.options.button_type;
    vm.customButtonModel.display = response.options.display;
    vm.customButtonModel.display_for = response.options.display_for;
    vm.customButtonModel.submit_how = response.options.submit_how;

    vm.customButtonModel.resource_id = response.resource_action.id;
    vm.customButtonModel.dialog_id = response.resource_action.dialog_id;
    vm.customButtonModel.ae_instance = response.resource_action.ae_instance;
    vm.customButtonModel.ae_message = response.resource_action.ae_message;
    vm.customButtonModel.request = response.resource_action.ae_attributes.request;

    vm.customButtonModel.current_visibility = response.visibility.roles[0] === '_ALL_' || response.visibility.roles.length === 0 ? 'all' : 'role';

    vm.genericObjectDefinitionRecordId = response.applies_to_id;

    vm.customButtonModel.uri_attributes = response.uri_attributes;

    if (vm.customButtonModel.current_visibility === 'role') {
      _.forEach(vm.customButtonModel.available_roles, function(role, index) {
        if (_.includes(response.visibility.roles, role.name)) {
          vm.customButtonModel.available_roles[index].value = true;
        }
      });
    }

    delete vm.customButtonModel.resource_action.ae_attributes.request;
    delete vm.customButtonModel.resource_action.ae_attributes.service_template;
    delete vm.customButtonModel.resource_action.ae_attributes.hosts;

    vm.customButtonModel.attribute_values = Object.values(vm.customButtonModel.resource_action.ae_attributes);
    vm.customButtonModel.attribute_names = Object.keys(vm.customButtonModel.resource_action.ae_attributes);
    vm.customButtonModel.noOfAttributeValueRows = vm.customButtonModel.attribute_names.length;

    if (!vm.customButtonModel.uri_attributes.hosts || vm.customButtonModel.uri_attributes.hosts === "localhost") {
      vm.inventory = "localhost";
    } else if (vm.customButtonModel.uri_attributes.hosts === "vmdb_object") {
      vm.inventory = "vmdb_object";
    } else {
      vm.inventory = "manual";
    }
    vm.modelCopy = angular.element.extend(true, {}, vm.customButtonModel);
  }
}
