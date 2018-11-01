ManageIQ.angular.app.controller('aeMethodFormController', aeMethodFormController);
aeMethodFormController.$inject = ['$http', '$scope', 'aeMethodFormId', 'currentRegion', 'miqService', 'playbookReusableCodeMixin'];

function aeMethodFormController($http, $scope, aeMethodFormId, currentRegion, miqService, playbookReusableCodeMixin) {
  var vm = this;
  var init = function() {
    vm.aeMethodModel = {
      name: '',
      display_name: '',
      location: '',
      namespace_path: '',
      class_id: '',
      language: '',
      scope: '',
      key: '',
      key_value: '',
      key_type: 'string',
      available_datatypes: '',
      provisioning_repository_id: '',
      provisioning_playbook_id: '',
      provisioning_machine_credential_id: '',
      provisioning_network_credential_id: '',
      provisioning_cloud_credential_id: '',
      provisioning_vault_credential_id: '',
      provisioning_key: '',
      provisioning_value: '',
      provisioning_type: 'string',
      provisioning_inputs: [],
      provisioning_verbosity: '0',
      provisioning_editMode: false,
      provisioning_become_enabled: false,
      provisioning_execution_ttl: '',
      provisioning_inventory: 'localhost',
      provisioning_log_output: 'on_error',
    };
    vm.verbosity_types = playbookReusableCodeMixin.getVerbosityTypes();
    vm.log_output_types = playbookReusableCodeMixin.getLogOutputTypes();
    vm.provisioning_cloud_type = '';
    vm.currentRegion = currentRegion;
    vm.formId = aeMethodFormId;
    vm.afterGet = false;
    vm.model = 'aeMethodModel';
    vm.inventory_mode = 'localhost';

    ManageIQ.angular.scope = $scope;

    $http.get('method_form_fields/' + aeMethodFormId)
      .then(getMethodFormData)
      .catch(miqService.handleFailure);
    vm.saveable = miqService.saveable;
    vm.newRecord = aeMethodFormId === 'new';
    if (aeMethodFormId === 'new') {
      playbookReusableCodeMixin.formOptions(vm);
    }
  };

  function getMethodFormData(response) {
    var data = response.data;
    vm.aeMethodModel.name = data.name;
    vm.aeMethodModel.display_name = data.display_name;
    vm.aeMethodModel.namespace_path = data.namespace_path;
    vm.aeMethodModel.location = data.location;
    vm.aeMethodModel.class_id = data.class_id;
    vm.aeMethodModel.language = data.language;
    vm.aeMethodModel.scope = data.scope;
    vm.aeMethodModel.available_datatypes = data.available_datatypes;
    playbookReusableCodeMixin.formOptions(vm);
    playbookReusableCodeMixin.formCloudCredentials(vm, data.config_info.cloud_credential_id, null);
    getConfigInfo(data.config_info);
    vm.modelCopy = angular.copy(vm.aeMethodModel);
  }

  var getConfigInfo = function(configData) {
    vm.aeMethodModel.provisioning_repository_id = configData.repository_id;
    vm.aeMethodModel.provisioning_playbook_id = configData.playbook_id;
    vm.aeMethodModel.provisioning_machine_credential_id = configData.credential_id;
    vm.aeMethodModel.provisioning_network_credential_id = configData.network_credential_id;
    vm.aeMethodModel.provisioning_vault_credential_id = configData.vault_credential_id;
    vm.aeMethodModel.provisioning_cloud_credential_id = playbookReusableCodeMixin.setIfDefined(configData.cloud_credential_id);
    vm.aeMethodModel.provisioning_become_enabled = configData.become_enabled === true;
    vm.aeMethodModel.provisioning_key = '';
    vm.aeMethodModel.provisioning_value = '';
    vm.aeMethodModel.provisioning_execution_ttl = configData.execution_ttl;
    vm.aeMethodModel.provisioning_inventory = configData.hosts;
    if (configData.hosts !== 'localhost') {
      vm.inventory_mode = 'specify';
    }
    vm.aeMethodModel.provisioning_log_output = configData.log_output;

    if (configData.verbosity === undefined || configData.verbosity === '') {
      vm.aeMethodModel.provisioning_verbosity = '0';
    } else {
      vm.aeMethodModel.provisioning_verbosity = configData.verbosity;
    }
    setExtraVars('provisioning_inputs', configData.extra_vars);
  };

  var setExtraVars = function(variableName, extraVars) {
    if (extraVars !== 'undefined') {
      vm.aeMethodModel[variableName] = [];
      extraVars.forEach(function(arrayItem) {
        var inputVars = [arrayItem.name, arrayItem.default_value, arrayItem.datatype, arrayItem.id];
        vm.aeMethodModel[variableName].push(inputVars);
      });
    }
    playbookReusableCodeMixin.checkFormPristine(vm.aeMethodModel, vm.modelCopy, $scope.angularForm);
  };

  vm.resetClicked = function() {
    vm.aeMethodModel = angular.copy(vm.modelCopy);
    playbookReusableCodeMixin.formOptions(vm);
    playbookReusableCodeMixin.cloudCredentialsList(vm, vm.aeMethodModel.provisioning_cloud_credential_id);
    playbookReusableCodeMixin.checkFormDataRetrieval(vm);
    $scope.angularForm.$setUntouched(true);
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  var methodEditButtonClicked = function(buttonName) {
    miqService.sparkleOn();
    var url = '/miq_ae_class/add_update_method/' + aeMethodFormId + '?button=' + buttonName;
    miqService.miqAjaxButton(url, setConfigInfo(vm.aeMethodModel, vm.modelCopy));
  };

  vm.cancelClicked = function() {
    methodEditButtonClicked('cancel');
    $scope.angularForm.$setPristine(true);
  };

  vm.saveClicked = function() {
    methodEditButtonClicked('save');
  };

  vm.addClicked = function() {
    methodEditButtonClicked('add');
  };

  var setConfigInfo = function(configData) {
    var method = {
      name: configData.name,
      display_name: configData.display_name,
      class_id: configData.class_id,
      language: configData.language,
      scope: configData.scope,
      location: 'playbook',
      repository_id: configData.provisioning_repository_id,
      playbook_id: configData.provisioning_playbook_id,
      credential_id: configData.provisioning_machine_credential_id,
      vault_credential_id: configData.provisioning_vault_credential_id,
      verbosity: configData.provisioning_verbosity,
      become_enabled: configData.provisioning_become_enabled,
      execution_ttl: configData.provisioning_execution_ttl,
      log_output: configData.provisioning_log_output,
      hosts: configData.provisioning_inventory,
      extra_vars: configData.provisioning_inputs,
    };
    if (configData.provisioning_network_credential_id !== '') {
      method.network_credential_id = configData.provisioning_network_credential_id;
    }

    if (configData.provisioning_cloud_credential_id !== '') {
      method.cloud_credential_id = configData.provisioning_cloud_credential_id;
    }
    return method;
  };

  $scope.$watch('vm._provisioning_repository', function(value) {
    if (value) {
      playbookReusableCodeMixin.repositoryChanged(vm, 'provisioning', value.id);
    } else {
      vm.aeMethodModel.provisioning_repository_id = '';
    }
    playbookReusableCodeMixin.checkFormPristine(vm.aeMethodModel, vm.modelCopy, $scope.angularForm);
  });

  $scope.$watch('vm.aeMethodModel.key_type', function(value) {
    if (value && vm.aeMethodModel.key_type === vm.aeMethodModel.original_key_type) {
      vm.aeMethodModel.key_value = '';
    }
    playbookReusableCodeMixin.checkFormPristine(vm.aeMethodModel, vm.modelCopy, $scope.angularForm);
  });

  $scope.$watch('vm.aeMethodModel.provisioning_type', function(value) {
    if (value) {
      vm.aeMethodModel.provisioning_value = '';
    }
    playbookReusableCodeMixin.checkFormPristine(vm.aeMethodModel, vm.modelCopy, $scope.angularForm);
  });

  vm.fieldsRequired = function(prefix) {
    return prefix === 'provisioning';
  };

  $scope.$watch('vm._provisioning_cloud_type', function(value) {
    playbookReusableCodeMixin.cloudTypeChanged(vm, 'provisioning', value);
    playbookReusableCodeMixin.checkFormPristine(vm.aeMethodModel, vm.modelCopy, $scope.angularForm);
  });

  vm.addKeyValue = function() {
    var valid = validateInputName(vm.aeMethodModel.provisioning_key, 0, 'add');
    if (! valid) {
      return miqService.miqFlash('error', __('Inputs name must be unique'));
    }
    vm.aeMethodModel.provisioning_inputs.push(
      [vm.aeMethodModel.provisioning_key, vm.aeMethodModel.provisioning_value, vm.aeMethodModel.provisioning_type]);
    vm.aeMethodModel.provisioning_key = '';
    vm.aeMethodModel.provisioning_value = '';
    vm.aeMethodModel.provisioning_type = 'string';
    return true;
  };

  vm.provisioning_repository_selected = function() {
    return vm.aeMethodModel.provisioning_repository_id !== '';
  };

  vm.removeKeyValue = function(index) {
    vm.aeMethodModel.provisioning_inputs.splice(index, 1);
    playbookReusableCodeMixin.checkFormPristine(vm.aeMethodModel, vm.modelCopy, $scope.angularForm);
  };

  vm.editKeyValue = function(key, keyValue, keyType, index) {
    vm.aeMethodModel.provisioning_editMode = true;
    vm.aeMethodModel.s_index = index;
    vm.aeMethodModel.key = key;
    vm.aeMethodModel.key_value = keyValue;
    vm.aeMethodModel.key_type = keyType;
    vm.aeMethodModel.original_key = key;
    vm.aeMethodModel.original_key_value = keyValue;
    vm.aeMethodModel.original_key_type = keyType;
  };

  vm.cancelKeyValue = function(index) {
    vm.aeMethodModel.provisioning_editMode = false;
    vm.aeMethodModel.s_index = '';
    vm.aeMethodModel.provisioning_inputs[index][0] = vm.aeMethodModel.original_key;
    vm.aeMethodModel.provisioning_inputs[index][1] = vm.aeMethodModel.original_key_value;
    vm.aeMethodModel.provisioning_inputs[index][2] = vm.aeMethodModel.original_key_type;
  };

  vm.saveKeyValue = function(index) {
    var valid = validateInputName(vm.aeMethodModel.key, index, 'edit');
    if (! valid) {
      return miqService.miqFlash('error', __('Input Name must be unique'));
    }
    vm.aeMethodModel.provisioning_editMode = false;
    vm.aeMethodModel.s_index = '';
    vm.aeMethodModel.provisioning_inputs[index][0] = vm.aeMethodModel.key;
    vm.aeMethodModel.provisioning_inputs[index][1] = vm.aeMethodModel.key_value;
    vm.aeMethodModel.provisioning_inputs[index][2] = vm.aeMethodModel.key_type;
    return true;
  };

  var validateInputName = function(inputName, index, type) {
    var valid = true;
    vm.aeMethodModel.provisioning_inputs.forEach(function(input, i) {
      // validate input name if input name is changed for current input parameter
      // or when new one is being added
      if ((type === 'add' && input[0] === inputName) || (type === 'edit' && index !== i && input[0] === inputName)) {
        valid = false;
      }
    });
    return valid;
  };

  // watch for all the drop downs on screen
  'provisioning_playbook provisioning_machine_credential provisioning_vault_credential provisioning_network_credential provisioning_cloud_credential'.split(' ').forEach(idWatch);

  function idWatch(name) {
    var fieldName = 'vm._' + name;
    $scope.$watch(fieldName, function(value) {
      vm.aeMethodModel[name + '_id'] = value ? value.id : '';
      playbookReusableCodeMixin.checkFormPristine(vm.aeMethodModel, vm.modelCopy, $scope.angularForm);
    });
  }

  init();
}
