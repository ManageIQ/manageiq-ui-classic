ManageIQ.angular.app.component('mainCustomButtonFormComponent', {
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

  var optionsPromise = null;
  var serviceDialogsPromise = null;
  var rolesPromise = null;
  var instancesPromise = null;

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
      open_url: false,
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
    };

    vm.dialogs = [];
    vm.button_types = [];
    vm.ae_instances = [];

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
    optionsPromise = API.options('/api/custom_buttons')
      .then(getCustomButtonOptions)
      .catch(miqService.handleFailure);

    serviceDialogsPromise = API.get('/api/service_dialogs?expand=resources&attributes=label')
      .then(getServiceDialogs)
      .catch(miqService.handleFailure);

    rolesPromise = API.get('/api/roles?expand=resources&attributes=name')
      .then(getRoles)
      .catch(miqService.handleFailure);

    instancesPromise = $http.get('/generic_object_definition/retrieve_distinct_instances_across_domains')
      .then(getDistinctInstancesAcrossDomains)
      .catch(miqService.handleFailure);

    if (vm.customButtonRecordId) {
      vm.newRecord = false;
      miqService.sparkleOn();
      var dataPromise = API.get('/api/custom_buttons/' + vm.customButtonRecordId + '?attributes=resource_action')
        .then(getCustomButtonFormData)
        .catch(miqService.handleFailure);
    } else {
      vm.newRecord = true;
      vm.modelCopy = angular.copy( vm.customButtonModel );
    }

    $q.all([optionsPromise, serviceDialogsPromise, rolesPromise, instancesPromise, dataPromise])
      .then(promisesResolvedForLoad);
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
    vm.customButtonModel = angular.element.extend(true, {}, vm.modelCopy);

    assignAllObjectsToKeyValueArrays(true);

    angularForm.$setUntouched(true);
    angularForm.$setPristine(true);

    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.saveClicked = function() {
    var saveMsg = sprintf(__('%s "%s" has been successfully saved.'), vm.entity, vm.customButtonModel.name);
    vm.saveWithAPI('put', '/api/custom_buttons/' + vm.customButtonRecordId, vm.prepSaveObject(), saveMsg);
  };

  vm.addClicked = function() {
    var saveMsg = sprintf(__('%s "%s" has been successfully added.'), vm.entity, vm.customButtonModel.name);
    vm.saveWithAPI('post', '/api/custom_buttons/', vm.prepSaveObject(), saveMsg);
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
      open_url: vm.customButtonModel.open_url,
      display_for: vm.customButtonModel.display_for,
      submit_how: vm.customButtonModel.submit_how,
    };

    vm.customButtonModel.resource_action.ae_attributes = _.zipObject(
      vm.customButtonModel.attribute_names,
      vm.customButtonModel.attribute_values);
    vm.customButtonModel.resource_action.ae_attributes.request = vm.customButtonModel.request;

    vm.customButtonModel.resource_action = {
      dialog_id: vm.customButtonModel.dialog_id,
      ae_namespace: 'SYSTEM',
      ae_class: 'PROCESS',
      ae_instance: vm.customButtonModel.ae_instance,
      ae_message: vm.customButtonModel.ae_message,
      ae_attributes: vm.customButtonModel.resource_action.ae_attributes,
    };

    if (vm.customButtonModel.current_visibility === 'role') {
      vm.customButtonModel.roles = _.map(_.filter(vm.customButtonModel.available_roles, function(role) {
        return role.value === true;
      }), 'name');
    }

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
    };
  };

  vm.saveWithAPI = function(method, url, saveObject, saveMsg) {
    miqService.sparkleOn();

    if (vm.customButtonGroupRecordId) {
      var saveCustomButtonPromise = API[method](url, saveObject);
      var saveMsgBtnInGrp = sprintf(__('%s "%s" has been successfully added under the selected button group.'), vm.entity, vm.customButtonModel.name);

      saveCustomButtonPromise.then(function(response) {
        $http.post('/generic_object_definition/add_button_in_group/' + vm.customButtonGroupRecordId + '?button_id=' + response.results[0].id)
          .then(miqService.redirectBack.bind(vm, saveMsgBtnInGrp, 'success', vm.redirectUrl))
          .catch(miqService.handleFailure);
      });
    } else {
      API[method](url, saveObject)
        .then(miqService.redirectBack.bind(vm, saveMsg, 'success', vm.redirectUrl))
        .catch(miqService.handleFailure);
    }
  };

  // private functions
  function getCustomButtonFormData(response) {
    Object.assign(vm.customButtonModel, response);

    vm.customButtonModel.button_icon = response.options.button_icon;
    vm.customButtonModel.button_color = response.options.button_color;
    vm.customButtonModel.button_type = response.options.button_type;
    vm.customButtonModel.display = response.options.display;
    vm.customButtonModel.open_url = response.options.open_url;
    vm.customButtonModel.display_for = response.options.display_for;
    vm.customButtonModel.submit_how = response.options.submit_how;

    vm.customButtonModel.dialog_id = response.resource_action.dialog_id;
    vm.customButtonModel.ae_instance = response.resource_action.ae_instance;
    vm.customButtonModel.ae_message = response.resource_action.ae_message;
    vm.customButtonModel.request = response.resource_action.ae_attributes.request;

    vm.customButtonModel.current_visibility = response.visibility.roles[0] === '_ALL_' || response.visibility.roles.length === 0 ? 'all' : 'role';

    vm.genericObjectDefinitionRecordId = response.applies_to_id;

    optionsPromise.then(function() {
      if (vm.customButtonModel.current_visibility === 'role') {
        _.forEach(vm.customButtonModel.available_roles, function(role, index) {
          if (_.includes(response.visibility.roles, role.name)) {
            vm.customButtonModel.available_roles[index].value = true;
          }
        });
      }

      delete vm.customButtonModel.resource_action.ae_attributes.request;
      vm.customButtonModel.noOfAttributeValueRows = assignObjectToKeyValueArrays(
        vm.customButtonModel.resource_action.ae_attributes,
        vm.customButtonModel.attribute_names,
        vm.customButtonModel.attribute_values);

      vm.modelCopy = angular.element.extend(true, {}, vm.customButtonModel);
    });
  }

  function assignAllObjectsToKeyValueArrays(purge) {
    if (purge) {
      vm.customButtonModel.attribute_names = [];
      vm.customButtonModel.attribute_values = [];
    }

    vm.customButtonModel.noOfAttributeValueRows = assignObjectToKeyValueArrays(
      vm.customButtonModel.resource_action.ae_attributes,
      vm.customButtonModel.attribute_names,
      vm.customButtonModel.attribute_values);

    vm.modelCopy = angular.element.extend(true, {}, vm.customButtonModel);
  }

  function assignObjectToKeyValueArrays(obj, keyArray, valueArray) {
    if (_.size(obj) === 0) {
      keyArray.push('');
    } else {
      _.forEach(obj, function(value, key) {
        if (valueArray) {
          keyArray.push(key);
          valueArray.push(value);
        } else {
          keyArray.push(value);
        }
      });
    }
    return _.size(keyArray);
  }

  function getCustomButtonOptions(response) {
    _.forEach(response.data.custom_button_types, function(name, id) {
      vm.button_types.push({id: id, name: name});
    });
  }

  function getServiceDialogs(response) {
    _.forEach(response.resources, function(item) {
      vm.dialogs.push({id: item.id, label: item.label});
    });
  }

  function getRoles(response) {
    _.forEach(response.resources, function(item) {
      vm.customButtonModel.available_roles.push({name: item.name, value: false});
    });
  }

  function getDistinctInstancesAcrossDomains(response) {
    _.forEach(response.data.distinct_instances_across_domains, function(item) {
      vm.ae_instances.push({id: item, name: item});
    });
  }

  function promisesResolvedForLoad() {
    vm.afterGet = true;
    miqService.sparkleOff();
  }
}
