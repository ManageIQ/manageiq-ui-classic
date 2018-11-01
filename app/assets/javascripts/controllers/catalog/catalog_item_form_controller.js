ManageIQ.angular.app.controller('catalogItemFormController', ['$scope', 'catalogItemFormId', 'currentRegion', 'miqService', 'postService', 'catalogItemDataFactory', 'playbookReusableCodeMixin', 'allCatalogsNames', function($scope, catalogItemFormId, currentRegion, miqService, postService, catalogItemDataFactory, playbookReusableCodeMixin, allCatalogsNames) {
  var vm = this;
  var init = function() {
    vm.catalogItemModel = {
      name: '',
      description: '',
      long_description: '',
      display: false,
      prov_type: 'generic_ansible_playbook',
      catalog_id: '',
      key: '',
      key_value: '',
      provisioning_repository_id: '',
      provisioning_playbook_id: '',
      provisioning_machine_credential_id: '',
      provisioning_network_credential_id: '',
      provisioning_cloud_credential_id: '',
      provisioning_vault_credential_id: '',
      provisioning_execution_ttl: '',
      provisioning_inventory: 'localhost',
      provisioning_dialog_existing: 'existing',
      provisioning_dialog_id: '',
      provisioning_dialog_name: '',
      provisioning_key: '',
      provisioning_value: '',
      provisioning_variables: {},
      provisioning_become_enabled: false,
      provisioning_verbosity: '0',
      provisioning_editMode: false,
      provisioning_log_output: 'on_error',
      retirement_repository_id: '',
      retirement_playbook_id: '',
      retirement_machine_credential_id: '',
      retirement_network_credential_id: '',
      retirement_cloud_credential_id: '',
      retirement_vault_credential_id: '',
      retirement_execution_ttl: '',
      retirement_inventory: 'localhost',
      retirement_key: '',
      retirement_value: '',
      retirement_variables: {},
      retirement_editMode: false,
      retirement_become_enabled: false,
      retirement_verbosity: '0',
      retirement_log_output: 'on_error',
    };
    vm.model = 'catalogItemModel';
    vm.log_output_types = playbookReusableCodeMixin.getLogOutputTypes();
    vm.verbosity_types = playbookReusableCodeMixin.getVerbosityTypes();
    playbookReusableCodeMixin.getRemoveResourcesTypes(vm);
    vm.provisioning_cloud_type = '';
    vm.retirement_cloud_type = '';
    vm.currentRegion = currentRegion;
    vm.formId = catalogItemFormId;
    vm.afterGet = false;
    vm.inventory_mode = 'localhost';
    vm.all_catalogs = allCatalogsNames;

    ManageIQ.angular.scope = $scope;

    if (catalogItemFormId === 'new') {
      $scope.newRecord = true;
      playbookReusableCodeMixin.formOptions(vm);
      playbookReusableCodeMixin.formCloudCredentials(vm, null, null);
      vm.modelCopy = angular.copy(vm.catalogItemModel);
    } else {
      vm.newRecord = false;
      catalogItemDataFactory.getCatalogItemData(catalogItemFormId).then(function(catalogItemData) {
        $scope.newRecord = false;
        vm.catalogItemModel.name = catalogItemData.name;
        vm.catalogItemModel.description = catalogItemData.description;
        vm.catalogItemModel.long_description = catalogItemData.long_description;
        vm.catalogItemModel.display = catalogItemData.display;
        vm.catalogItemModel.catalog_id = catalogItemData.service_template_catalog_id === undefined ? '' : catalogItemData.service_template_catalog_id;
        vm.catalogItemModel.provisioning_dialog_id = catalogItemData.config_info.provision.dialog_id;
        playbookReusableCodeMixin.formOptions(vm);
        playbookReusableCodeMixin.formCloudCredentials(vm, catalogItemData.config_info.provision.cloud_credential_id, catalogItemData.config_info.retirement.cloud_credential_id);
        getConfigInfo(catalogItemData.config_info);
        vm.modelCopy = angular.copy(vm.catalogItemModel);
      });
    }
  };

  var getConfigInfo = function(configData) {
    vm.catalogItemModel.provisioning_repository_id = configData.provision.repository_id;
    vm.catalogItemModel.provisioning_playbook_id = configData.provision.playbook_id;
    vm.catalogItemModel.provisioning_machine_credential_id = configData.provision.credential_id;
    vm.catalogItemModel.provisioning_network_credential_id = configData.provision.network_credential_id;
    vm.catalogItemModel.provisioning_cloud_credential_id = playbookReusableCodeMixin.setIfDefined(configData.provision.cloud_credential_id);
    vm.catalogItemModel.provisioning_vault_credential_id = playbookReusableCodeMixin.setIfDefined(configData.provision.vault_credential_id);
    vm.catalogItemModel.provisioning_execution_ttl = configData.provision.execution_ttl;
    vm.catalogItemModel.provisioning_inventory = configData.provision.hosts;
    if (configData.provision.hosts !== 'localhost') {
      vm.inventory_mode = 'specify';
    }
    vm.catalogItemModel.provisioning_log_output = configData.provision.log_output;
    if (configData.provision.log_output === undefined) {
      vm.catalogItemModel.provisioning_log_output = 'on_error';
    }
    vm.catalogItemModel.provisioning_dialog_existing = configData.provision.dialog_id ? 'existing' : 'create';
    vm.catalogItemModel.provisioning_dialog_name = configData.provision.new_dialog_name;
    vm.catalogItemModel.provisioning_key = '';
    vm.catalogItemModel.provisioning_value = '';
    if (configData.provision.become_enabled === undefined) {
      vm.catalogItemModel.provisioning_become_enabled = false;
    } else {
      vm.catalogItemModel.provisioning_become_enabled = configData.provision.become_enabled;
    }

    if (configData.provision.verbosity === undefined) {
      vm.catalogItemModel.provisioning_verbosity = '0';
    } else {
      vm.catalogItemModel.provisioning_verbosity = configData.provision.verbosity;
    }

    setExtraVars('provisioning_variables', configData.provision.extra_vars);

    if (typeof configData.retirement.repository_id !== 'undefined') {
      vm.catalogItemModel.retirement_repository_id = configData.retirement.repository_id;
      vm.catalogItemModel.retirement_playbook_id = configData.retirement.playbook_id;
      playbookReusableCodeMixin.getRemoveResourcesTypes(vm);
      vm.catalogItemModel.retirement_remove_resources = configData.retirement.remove_resources;
      vm.catalogItemModel.retirement_machine_credential_id = configData.retirement.credential_id;
      vm.catalogItemModel.retirement_vault_credential_id = configData.retirement.vault_credential_id;
    }
    if (configData.retirement.become_enabled === undefined) {
      vm.catalogItemModel.retirement_become_enabled = false;
    } else {
      vm.catalogItemModel.retirement_become_enabled = configData.retirement.become_enabled;
    }

    if (configData.retirement.verbosity === undefined) {
      vm.catalogItemModel.retirement_verbosity = '0';
    } else {
      vm.catalogItemModel.retirement_verbosity = configData.retirement.verbosity;
    }

    vm.catalogItemModel.retirement_network_credential_id = configData.retirement.network_credential_id;
    vm.catalogItemModel.retirement_vault_credential_id = playbookReusableCodeMixin.setIfDefined(configData.retirement.vault_credential_id);
    vm.catalogItemModel.retirement_cloud_credential_id = playbookReusableCodeMixin.setIfDefined(configData.retirement.cloud_credential_id);
    vm.catalogItemModel.retirement_execution_ttl = configData.retirement.execution_ttl;
    vm.catalogItemModel.retirement_inventory = configData.retirement.hosts;
    vm.catalogItemModel.retirement_key = '';
    vm.catalogItemModel.retirement_value = '';
    vm.catalogItemModel.retirement_log_output = configData.retirement.log_output;
    if (configData.retirement.log_output === undefined) {
      vm.catalogItemModel.retirement_log_output = 'on_error';
    }
    setExtraVars('retirement_variables', configData.retirement.extra_vars);
  };

  var setExtraVars = function(variableName, extraVars) {
    if (typeof extraVars !== 'undefined') {
      vm.catalogItemModel[variableName] = {};
      for (var key in extraVars) {
        vm.catalogItemModel[variableName][key] = extraVars[key].default;
      }
    }
    playbookReusableCodeMixin.checkFormPristine(vm.catalogItemModel, vm.modelCopy, $scope.angularForm);
  };

  var redirectUrl = '/catalog/explorer/' + catalogItemFormId;

  $scope.cancelClicked = function() {
    var msg;
    if ($scope.newRecord) {
      msg = sprintf(__('Add of Catalog Item was cancelled by the user'));
    } else {
      msg = sprintf(__('Edit of Catalog Item %s was cancelled by the user'), vm.catalogItemModel.description);
    }
    postService.cancelOperation('/catalog/explorer?', msg);
    $scope.angularForm.$setPristine(true);
  };

  $scope.resetClicked = function() {
    vm.catalogItemModel = angular.copy(vm.modelCopy);
    playbookReusableCodeMixin.formOptions(vm);
    playbookReusableCodeMixin.cloudCredentialsList(vm, vm.catalogItemModel.provisioning_cloud_credential_id, vm.catalogItemModel.retirement_cloud_credential_id);
    playbookReusableCodeMixin.checkFormDataRetrieval(vm);
    $scope.angularForm.$setUntouched(true);
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  $scope.saveClicked = function() {
    var successMsg = sprintf(__('Catalog Item %s was saved'), vm.catalogItemModel.name);
    postService.saveRecord('/api/service_templates/' + catalogItemFormId,
      redirectUrl + '?button=save',
      setConfigInfo(vm.catalogItemModel),
      successMsg);
  };

  $scope.addClicked = function($event, _formSubmit) {
    var successMsg = sprintf(__('Catalog Item %s was added'), vm.catalogItemModel.name);
    postService.createRecord('/api/service_templates',
      redirectUrl + '?button=add',
      setConfigInfo(vm.catalogItemModel),
      successMsg);
  };

  var formatExtraVars = function(extraVars) {
    if (typeof extraVars !== 'undefined') {
      var formattedExtraVars = {};
      for (var key in extraVars) {
        formattedExtraVars[key] = {'default': extraVars[key]};
      }
    }
    return formattedExtraVars;
  };

  var setConfigInfo = function(configData) {
    var catalog_item = {
      name: configData.name,
      description: configData.description,
      long_description: configData.long_description,
      display: configData.display,
      service_template_catalog_id: configData.catalog_id,
      prov_type: 'generic_ansible_playbook',
      type: 'ServiceTemplateAnsiblePlaybook',
      config_info: {
        provision: {
          repository_id: configData.provisioning_repository_id,
          playbook_id: configData.provisioning_playbook_id,
          credential_id: configData.provisioning_machine_credential_id,
          hosts: configData.provisioning_inventory,
          verbosity: configData.provisioning_verbosity,
          log_output: configData.provisioning_log_output,
          extra_vars: formatExtraVars(configData.provisioning_variables),
        },
      },
    };
    if (vm.catalogItemModel.provisioning_execution_ttl !== undefined) {
      catalog_item.config_info.provision.execution_ttl = configData.provisioning_execution_ttl;
    }
    catalog_item.config_info.provision.become_enabled = configData.provisioning_become_enabled;
    if (configData.provisioning_vault_credential_id !== '') {
      catalog_item.config_info.provision.vault_credential_id = configData.provisioning_vault_credential_id;
    }
    if (configData.provisioning_network_credential_id !== '') {
      catalog_item.config_info.provision.network_credential_id = configData.provisioning_network_credential_id;
    }
    if (configData.provisioning_cloud_credential_id !== '') {
      catalog_item.config_info.provision.cloud_credential_id = configData.provisioning_cloud_credential_id;
    }
    if (configData.provisioning_dialog_id !== undefined && configData.provisioning_dialog_id !== '') {
      catalog_item.config_info.provision.dialog_id = configData.provisioning_dialog_id;
    } else if (configData.provisioning_dialog_name !== '') {
      catalog_item.config_info.provision.new_dialog_name = configData.provisioning_dialog_name;
    }

    catalog_item.config_info.retirement = {
      remove_resources: configData.retirement_remove_resources,
      verbosity: configData.retirement_verbosity,
      log_output: configData.retirement_log_output,
    };

    var retirement = catalog_item.config_info.retirement;
    if (vm.catalogItemModel.retirement_repository_id !== undefined && configData.retirement_repository_id !== '') {
      retirement.repository_id = configData.retirement_repository_id;
      retirement.playbook_id = configData.retirement_playbook_id;
      retirement.credential_id = configData.retirement_machine_credential_id;
    }
    if (vm.catalogItemModel.retirement_playbook_id !== undefined && configData.retirement_playbook_id !== '') {
      if (vm.catalogItemModel.retirement_execution_ttl !== undefined) {retirement.execution_ttl = configData.retirement_execution_ttl;}
      retirement.hosts = configData.retirement_inventory;
      retirement.extra_vars = formatExtraVars(configData.retirement_variables);
      catalog_item.config_info.retirement.become_enabled = configData.retirement_become_enabled;
    }
    if (configData.retirement_vault_credential_id !== '') {catalog_item.config_info.retirement.vault_credential_id = configData.retirement_vault_credential_id;}

    if (configData.retirement_network_credential_id !== '') {catalog_item.config_info.retirement.network_credential_id = configData.retirement_network_credential_id;}

    if (configData.retirement_cloud_credential_id !== '') {catalog_item.config_info.retirement.cloud_credential_id = configData.retirement_cloud_credential_id;}

    return catalog_item;
  };

  // reset fields when retirement playbook type is changed
  $scope.$watch('vm._retirement_playbook', function(value) {
    if (value && (vm.catalogItemModel.retirement_inventory === undefined || vm.catalogItemModel.retirement_inventory === '')) {
      vm.catalogItemModel.retirement_inventory = 'localhost';
      vm.catalogItemModel.retirement_become_enabled = false;
    }
  });

  $scope.$watch('vm._provisioning_repository', function(value) {
    if (value) {
      playbookReusableCodeMixin.repositoryChanged(vm, 'provisioning', value.id);
    } else {
      vm.catalogItemModel.provisioning_repository_id = '';
    }
    playbookReusableCodeMixin.checkFormPristine(vm.catalogItemModel, vm.modelCopy, $scope.angularForm);
  });

  $scope.$watch('vm._retirement_repository', function(value) {
    if (value) {
      playbookReusableCodeMixin.repositoryChanged(vm, 'retirement', value.id);
    } else {
      vm.catalogItemModel.retirement_playbook_id = '';
      vm.catalogItemModel.retirement_repository_id = '';
      playbookReusableCodeMixin.getRemoveResourcesTypes(vm);
    }
    playbookReusableCodeMixin.checkFormPristine(vm.catalogItemModel, vm.modelCopy, $scope.angularForm);
  });

  $scope.$watch('vm._retirement_playbook', function(value) {
    if (value) {
      vm.catalogItemModel.retirement_playbook_id = value.id;
    } else {
      vm.catalogItemModel.retirement_playbook_id = '';
    }
    playbookReusableCodeMixin.checkFormPristine(vm.catalogItemModel, vm.modelCopy, $scope.angularForm);
  });

  $scope.$watch('vm.catalogItemModel.display', function(value) {
    vm.catalogItemModel.display = value;
    return vm.catalogItemModel.display;
  });

  $scope.$watch('vm._provisioning_cloud_type', function(value) {
    playbookReusableCodeMixin.cloudTypeChanged(vm, 'provisioning', value);
    playbookReusableCodeMixin.checkFormPristine(vm.catalogItemModel, vm.modelCopy, $scope.angularForm);
  });

  $scope.$watch('vm._retirement_cloud_type', function(value) {
    playbookReusableCodeMixin.cloudTypeChanged(vm, 'retirement', value);
    playbookReusableCodeMixin.checkFormPristine(vm.catalogItemModel, vm.modelCopy, $scope.angularForm);
  });

  vm.addKeyValue = function(prefix) {
    if (vm.catalogItemModel[prefix + '_variables'].hasOwnProperty(vm.catalogItemModel[prefix + '_key'])) {
      return miqService.miqFlash('error', __('Variable name must be unique'));
    }
    vm.catalogItemModel[prefix + '_variables'][vm.catalogItemModel[prefix + '_key']] =  vm.catalogItemModel[prefix + '_value'];
    vm.catalogItemModel[prefix + '_key'] = '';
    vm.catalogItemModel[prefix + '_value'] = '';
    return true;
  };

  vm.provisioning_repository_selected = function() {
    return vm.catalogItemModel.provisioning_repository_id !== '';
  };

  vm.retirement_repository_selected = function() {
    return vm.catalogItemModel.retirement_repository_id !== '';
  };

  vm.retirement_playbook_selected = function(prefix) {
    if (prefix === 'provisioning') {
      return true;
    }
    return vm.catalogItemModel.retirement_playbook_id !== '';
  };

  vm.removeKeyValue = function(prefix, key) {
    delete vm.catalogItemModel[prefix + '_variables'][key];
    playbookReusableCodeMixin.checkFormPristine(vm.catalogItemModel, vm.modelCopy, $scope.angularForm);
  };

  vm.editKeyValue = function(prefix, key, key_value, index) {
    vm.catalogItemModel[prefix + '_editMode'] = true;
    vm.catalogItemModel.s_index = index;
    vm.catalogItemModel.key = key;
    vm.catalogItemModel.key_value = key_value;
    vm.catalogItemModel.original_key = key;
    vm.catalogItemModel.original_key_value = key_value;
  };

  vm.cancelKeyValue = function(prefix) {
    vm.catalogItemModel[prefix + '_editMode'] = false;
    vm.catalogItemModel.s_index = '';
    vm.catalogItemModel[prefix + '_variables'][vm.catalogItemModel.original_key] = vm.catalogItemModel.original_key_value;
  };

  vm.saveKeyValue = function(prefix) {
    if (vm.catalogItemModel.key in vm.catalogItemModel[prefix + '_variables'] && vm.catalogItemModel.original_key_value === vm.catalogItemModel.key_value) {
      return miqService.miqFlash('error', __('Variable name must be unique'));
    }
    vm.catalogItemModel[prefix + '_editMode'] = false;
    vm.catalogItemModel.s_index = '';
    // delete key if key name was edited, and a add new key to hash with new name
    if (vm.catalogItemModel.original_key !== vm.catalogItemModel.key) {
      delete vm.catalogItemModel[prefix + '_variables'][vm.catalogItemModel.original_key];
    }

    vm.catalogItemModel[prefix + '_variables'][vm.catalogItemModel.key] = vm.catalogItemModel.key_value;
    return true;
  };

  vm.toggleDialogSelection = function(prefix, selected_value) {
    vm.catalogItemModel[prefix + '_dialog_existing'] = selected_value;
    vm._provisioning_dialog = '';
    vm.catalogItemModel[prefix + '_dialog_id'] = '';
    vm.catalogItemModel[prefix  + '_dialog_name'] = '';
  };

  vm.fieldsRequired = function(prefix) {
    return prefix === 'provisioning';
  };

  vm.variablesEmpty = function(prefix) {
    var field = vm.catalogItemModel[prefix + '_variables'];
    return Object.keys(field).length === 0;
  };

  // watch for all the drop downs on screen
  'catalog provisioning_playbook retirement_playbook provisioning_machine_credential retirement_machine_credential provisioning_vault_credential retirement_vault_credential provisioning_network_credential retirement_network_credential provisioning_cloud_credential retirement_cloud_credential provisioning_dialog'.split(' ').forEach(idWatch);

  function idWatch(name) {
    var fieldName = 'vm._' + name;
    $scope.$watch(fieldName, function(value) {
      vm.catalogItemModel[name + '_id'] = value ? value.id : '';
      playbookReusableCodeMixin.checkFormPristine(vm.catalogItemModel, vm.modelCopy, $scope.angularForm);
    });
  }

  // watch for all the drop downs on screen
  'retirement_remove_resources'.split(' ').forEach(typeWatch);

  function typeWatch(name) {
    var fieldName = 'vm.catalogItemModel.' + name;
    $scope.$watch(fieldName, function(value) {
      if (value) {
        vm.catalogItemModel[name] = value;
      }
      playbookReusableCodeMixin.checkFormPristine(vm.catalogItemModel, vm.modelCopy, $scope.angularForm);
    });
  }

  $scope.cancelCopyProvisioning = function() {
    closeConfirmationModal();
  };

  $scope.copyProvisioning = function() {
    closeConfirmationModal();
    playbookReusableCodeMixin.formOptions(vm);
    vm.catalogItemModel.retirement_repository_id = vm.catalogItemModel.provisioning_repository_id;
    vm.catalogItemModel.retirement_playbook_id = vm.catalogItemModel.provisioning_playbook_id;
    vm.catalogItemModel.retirement_machine_credential_id = vm.catalogItemModel.provisioning_machine_credential_id;
    vm.catalogItemModel.retirement_network_credential_id = vm.catalogItemModel.provisioning_network_credential_id;
    vm.catalogItemModel.retirement_vault_credential_id = vm.catalogItemModel.provisioning_vault_credential_id;
    vm.retirement_cloud_type = vm.provisioning_cloud_type;
    vm._retirement_cloud_type = vm.provisioning_cloud_type;
    vm.catalogItemModel.retirement_cloud_credential_id = vm.catalogItemModel.provisioning_cloud_credential_id;
    vm.catalogItemModel.retirement_execution_ttl = vm.catalogItemModel.provisioning_execution_ttl;
    vm.catalogItemModel.retirement_inventory = vm.catalogItemModel.provisioning_inventory;
    vm.catalogItemModel.retirement_become_enabled = vm.catalogItemModel.provisioning_become_enabled;
    vm.catalogItemModel.retirement_verbosity = vm.catalogItemModel.provisioning_verbosity;
    vm.catalogItemModel.retirement_log_output = vm.catalogItemModel.provisioning_log_output;
    vm.catalogItemModel.retirement_key = '';
    vm.catalogItemModel.retirement_value = '';
    vm.catalogItemModel.retirement_variables = angular.copy(vm.catalogItemModel.provisioning_variables);
    playbookReusableCodeMixin.getRemoveResourcesTypes(vm);
    playbookReusableCodeMixin.checkFormPristine(vm.catalogItemModel, vm.modelCopy, $scope.angularForm);
    miqService.sparkleOff();
  };

  var closeConfirmationModal = function() {
    angular.element('#confirmationModal').modal('hide');
  };

  $scope.dialogNameValidation = function() {
    miqService.miqFlashClear();
    $scope.angularForm.$setValidity('unchanged', true);

    if (vm.dialogs.filter(function(e) { return e.label === vm.catalogItemModel.provisioning_dialog_name; }).length > 0) {
      miqService.miqFlash('error', __('Dialog name already exists'));
      $scope.angularForm.$setValidity('unchanged', false);
    }
  };

  init();
}]);

// Javascript function to be called from confirmation modal outside of Angular controller.
function cancelOrCopyProvisioning(buttonType) {
  var scope = angular.element('#form_div').scope();
  scope.$apply(function() {
    if (buttonType === 'cancel') {
      scope.cancelCopyProvisioning();
    } else {
      scope.copyProvisioning();
    }
  });
}
