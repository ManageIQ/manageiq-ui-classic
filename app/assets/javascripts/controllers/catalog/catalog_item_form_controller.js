ManageIQ.angular.app.controller('catalogItemFormController', ['$scope', 'catalogItemFormId', 'miqService', 'postService', 'API', 'catalogItemDataFactory', function($scope, catalogItemFormId, miqService, postService, API, catalogItemDataFactory) {
  var vm = this;
  var init = function() {
    vm.catalogItemModel = {
      name: '',
      description: '',
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
      provisioning_inventory: 'localhost',
      provisioning_dialog_existing: 'existing',
      provisioning_dialog_id: '',
      provisioning_dialog_name: '',
      provisioning_key: '',
      provisioning_value: '',
      provisioning_variables: {},
      provisioning_editMode: false,
      provisioning_cloud_type: '',
      retirement_repository_id: '',
      retirement_playbook_id: '',
      retirement_machine_credential_id: '',
      retirement_network_credential_id: '',
      retirement_cloud_credential_id: '',
      retirement_inventory: 'localhost',
      retirement_dialog_existing: 'existing',
      retirement_dialog_id: '',
      retirement_dialog_name: '',
      retirement_key: '',
      retirement_value: '',
      retirement_variables: {},
      retirement_editMode: false,
      retirement_cloud_type: '',
      cloud_types: ["Amazon", "Azure", "Google", "Openstack", "Vmware"]
    };
    vm.formId = catalogItemFormId;
    vm.afterGet = false;
    vm.model = "catalogItemModel";

    ManageIQ.angular.scope = $scope;

    if (catalogItemFormId == 'new') {
      $scope.newRecord = true;
      vm.formOptions();
      vm.afterGet  = true;
      vm.modelCopy = angular.copy( vm.catalogItemModel );
    } else {
      vm.newRecord = false;
      catalogItemDataFactory.getCatalogItemData(catalogItemFormId).then(function (catalogItemData) {
        $scope.newRecord = false;
        vm.catalogItemModel.name = catalogItemData.name;
        vm.catalogItemModel.description = catalogItemData.description;
        vm.catalogItemModel.display = catalogItemData.display;
        vm.catalogItemModel.catalog_id = catalogItemData.service_template_catalog_id;
        vm.catalogItemModel.provisioning_dialog_id  = catalogItemData.provisioning_dialog_id;
        vm.catalogItemModel.retirement_dialog_id  = catalogItemData.retirement_dialog_id;
        vm.formOptions();
        getConfigInfo(catalogItemData.config_info);
        vm.afterGet = true;
        vm.modelCopy = angular.copy(vm.catalogItemModel);
      });
    }
  };

  var getConfigInfo = function(configData) {
    vm.catalogItemModel.provisioning_repository_id = configData.provision.repository_id;
    vm.catalogItemModel.provisioning_playbook_id = configData.provision.playbook_id;
    vm.catalogItemModel.provisioning_machine_credential_id = configData.provision.credential_id;
    vm.catalogItemModel.provisioning_network_credential_id = configData.provision.network_credential_id;
    vm.catalogItemModel.provisioning_cloud_credential_id = configData.provision.cloud_credential_id;
    vm.catalogItemModel.provisioning_inventory = configData.provision.hosts;
    vm.catalogItemModel.provisioning_dialog_existing = configData.provision.dialog_id ? "existing" : "create";
    vm.catalogItemModel.provisioning_dialog_id = configData.provision.dialog_id;
    vm.catalogItemModel.provisioning_dialog_name = configData.provision.new_dialog_name;
    vm.catalogItemModel.provisioning_key = '';
    vm.catalogItemModel.provisioning_value = '';
    vm.catalogItemModel.provisioning_variables = configData.provision.extra_vars;

    if (typeof configData.retirement !== 'undefined') {
      vm.catalogItemModel.retirement_repository_id = configData.retirement.repository_id;
      vm.catalogItemModel.retirement_playbook_id = configData.retirement.playbook_id;
      vm.catalogItemModel.retirement_machine_credential_id = configData.retirement.credential_id;
      vm.catalogItemModel.retirement_network_credential_id = configData.retirement.network_credential_id;
      vm.catalogItemModel.retirement_cloud_credential_id = configData.retirement.cloud_credential_id;
      vm.catalogItemModel.retirement_inventory = configData.retirement.hosts;
      vm.catalogItemModel.retirement_dialog_existing = configData.retirement.dialog_id ? "existing" : "create";
      vm.catalogItemModel.retirement_dialog_id = configData.retirement.dialog_id;
      vm.catalogItemModel.retirement_dialog_name = configData.retirement.new_dialog_name;
      vm.catalogItemModel.retirement_key = '';
      vm.catalogItemModel.retirement_value = '';
      vm.catalogItemModel.retirement_variables = configData.retirement.extra_vars;
    }
  }

  var redirectUrl = '/catalog/explorer/' + catalogItemFormId;

  $scope.cancelClicked = function() {
    if ($scope.newRecord)
      var msg = sprintf(__("Add of Catalog Item was cancelled by the user"));
    else
      var msg = sprintf(__("Edit of Catalog Item %s was cancelled by the user"), vm.catalogItemModel.description);
    postService.cancelOperation('/catalog/explorer?', msg);
    $scope.angularForm.$setPristine(true);
  };

  $scope.resetClicked = function() {
    vm.catalogItemModel = angular.copy( vm.modelCopy );
    vm.formOptions();
    $scope.angularForm.$setUntouched(true);
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  $scope.saveClicked = function() {
    var successMsg = sprintf(__("Catalog Item %s was saved"), vm.catalogItemModel.name);
    postService.saveRecord('/api/service_templates/' + catalogItemFormId,
      redirectUrl + '?button=save',
      setConfigInfo(vm.catalogItemModel),
      successMsg);
    $scope.angularForm.$setPristine(true);
  };

  $scope.addClicked = function($event, formSubmit) {
    var successMsg = sprintf(__("Catalog Item %s was added"), vm.catalogItemModel.name);
    postService.createRecord('/api/service_templates',
      redirectUrl + '?button=add',
      setConfigInfo(vm.catalogItemModel),
      successMsg);
    $scope.angularForm.$setPristine(true);
  };

  var setConfigInfo = function(configData) {
    catalog_item = {
      name: configData.name,
      description:  configData.description,
      display: configData.display,
      service_template_catalog_id: configData.catalog_id,
      prov_type: "generic_ansible_playbook",
      type: "ServiceTemplateAnsiblePlaybook",
      config_info: {
        provision: {
          repository_id: configData.provisioning_repository_id,
          playbook_id: configData.provisioning_playbook_id,
          credential_id: configData.provisioning_machine_credential_id,
          hosts: configData.provisioning_inventory,
          extra_vars: configData.provisioning_variables
        }
      }
    }

    if (configData.provisioning_network_credential_id !== '')
      catalog_item['config_info']['provision']['network_credential_id'] = configData.provisioning_network_credential_id;

    if (configData.provisioning_cloud_credential_id !== '')
      catalog_item['config_info']['provision']['cloud_credential_id'] = configData.provisioning_cloud_credential_id;

    if (configData.provisioning_dialog_id !== '') {
      catalog_item['config_info']['provision']['dialog_id'] = configData.provisioning_dialog_id;
    } else if (configData.provisioning_dialog_name !== '')
      catalog_item['config_info']['provision']['new_dialog_name'] = configData.provisioning_dialog_name;

    // add 'retirement' key only if required fields were selected
    if (configData.retirement_repository_id !== '') {
      catalog_item['config_info']['retirement'] = {
          repository_id: configData.retirement_repository_id,
          playbook_id: configData.retirement_playbook_id,
          credential_id: configData.retirement_machine_credential_id,
          hosts: configData.retirement_inventory,
          dialog_id: configData.retirement_dialog_id,
          extra_vars: configData.retirement_variables
      }

      if (configData.retirement_network_credential_id !== '')
        catalog_item['config_info']['retirement']['network_credential_id'] = configData.retirement_network_credential_id;

      if (configData.retirement_cloud_credential_id !== '')
        catalog_item['config_info']['retirement']['cloud_credential_id'] = configData.retirement_cloud_credential_id;

      if (configData.retirement_dialog_id !== '') {
        catalog_item['config_info']['retirement']['dialog_id'] = configData.retirement_dialog_id;
      } else if (configData.retirement_dialog_name !== '')
        catalog_item['config_info']['retirement']['new_dialog_name'] = configData.retirement_dialog_name;
    }

    return catalog_item;
  }


  // list of service catalogs
  vm.formOptions = function() {
    API.get("/api/service_catalogs/?expand=resources&attributes=id,name").then(function(data) {
      vm.catalogs = data.resources;
      vm._catalog = _.find(vm.catalogs, {id: vm.catalogItemModel.catalog_id});
    })

    // list of service dailaogs
    API.get("/api/service_dialogs/?expand=resources&attributes=id,label").then(function (data) {
      vm.dialogs = data.resources
      vm._retirement_dialog = _.find(vm.dialogs, {id: vm.catalogItemModel.retirement_dialog_id});
      vm._provisioning_dialog = _.find(vm.dialogs, {id: vm.catalogItemModel.provisioning_dialog_id});
    })

    // list of repositories
    API.get("/api/configuration_script_sources/?expand=resources&attributes=id,name").then(function (data) {
      vm.repositories = data.resources;
      vm._retirement_repository = _.find(vm.repositories, {id: vm.catalogItemModel.retirement_repository_id});
      vm._provisioning_repository = _.find(vm.repositories, {id: vm.catalogItemModel.provisioning_repository_id});
    })

    // list of machine credentials
    API.get("/api/authentications?collection_class=ManageIQ::Providers::AnsibleTower::AutomationManager::MachineCredential&expand=resources&attributes=id,name").then(function (data) {
      vm.machine_credentials = data.resources;
      vm._retirement_machine_credential = _.find(vm.machine_credentials, {id: vm.catalogItemModel.retirement_machine_credential_id});
      vm._provisioning_machine_credential = _.find(vm.machine_credentials, {id: vm.catalogItemModel.provisioning_machine_credential_id});
    })

    // list of network credentials
    API.get("/api/authentications?collection_class=ManageIQ::Providers::AnsibleTower::AutomationManager::NetworkCredential&expand=resources&attributes=id,name").then(function (data) {
      vm.network_credentials = data.resources;
      vm._retirement_network_credential = _.find(vm.network_credentials, {id: vm.catalogItemModel.retirement_network_credential_id});
      vm._provisioning_network_credential = _.find(vm.network_credentials, {id: vm.catalogItemModel.provisioning_network_credential_id});
    })
  };

  // get playbooks for selected repository
  vm.repositoryChanged = function(prefix, id) {
    API.get("/api/configuration_script_sources/" + id + "?attributes=configuration_script_payloads").then(function(data) {
      vm[prefix + '_playbooks']  = data.configuration_script_payloads;
      // if repository has changed
      if (id !== vm.catalogItemModel[prefix + '_repository_id']) {
        vm.catalogItemModel[prefix + '_playbook_id'] = '';
        vm.catalogItemModel[prefix + '_repository_id'] = id;
      } else {
        vm['_' + prefix + '_playbook'] = _.find(vm[prefix + '_playbooks'], {id: vm.catalogItemModel[prefix + '_playbook_id']});
      }
    })
  };

  $scope.$watch('vm._provisioning_repository', function(value) {
    if (value) {
      vm.repositoryChanged("provisioning", value.id)
    } else
      vm.catalogItemModel['provisioning_repository_id'] = '';
  });

  $scope.$watch('vm._retirement_repository', function(value) {
    if (value) {
      vm.repositoryChanged("retirement", value.id)
    } else
      vm.catalogItemModel['retirement_repository_id'] = '';
  });

  $scope.cloudTypeChanged = function(prefix) {
    typ = vm.catalogItemModel[prefix + "_cloud_type"];
    // list of cloud credentials based upon selected cloud type
    url = "/api/authentications?collection_class=ManageIQ::Providers::AnsibleTower::AutomationManager::" + typ + "Credential&expand=resources&attributes=id,name"
    API.get(url).then(function (data) {
      vm.cloud_credentials = data.resources;
      vm._retirement_cloud_credential = _.find(vm.cloud_credentials, {id: vm.catalogItemModel.retirement_cloud_credential_id});
      vm._provisioning_cloud_credential = _.find(vm.cloud_credentials, {id: vm.catalogItemModel.provisioning_cloud_credential_id});
    })
  }

  $scope.$watch('vm.catalogItemModel.display', function(value) {
    vm.catalogItemModel.display = value;
    return vm.catalogItemModel.display;
  })

  vm.addKeyValue = function(prefix) {
    vm.catalogItemModel[prefix + "_variables"][vm.catalogItemModel[prefix + "_key"]] =  vm.catalogItemModel[prefix + "_value"];
    vm.catalogItemModel[prefix + "_key"] = '';
    vm.catalogItemModel[prefix + "_value"] = '';
  }

  vm.provisioning_repository_selected = function() {
    return vm.catalogItemModel.provisioning_repository_id !== '';
  }

  vm.retirement_repository_selected = function() {
    return vm.catalogItemModel.retirement_repository_id !== '';
  }

  vm.removeKeyValue = function(prefix, key) {
    delete vm.catalogItemModel[prefix + "_variables"][key];
  }

  vm.editKeyValue = function(prefix, key, key_value, index) {
    vm.catalogItemModel[prefix + "_editMode"] = true;
    vm.catalogItemModel.s_index = index;
    vm.catalogItemModel.key = key;
    vm.catalogItemModel.key_value = key_value;
    vm.catalogItemModel.original_key = key;
    vm.catalogItemModel.original_key_value = key_value;
  }

  vm.cancelKeyValue = function(prefix) {
    vm.catalogItemModel[prefix + "_editMode"] = false;
    vm.catalogItemModel.s_index = '';
    vm.catalogItemModel[prefix + "_variables"][vm.catalogItemModel.original_key] = vm.catalogItemModel.original_key_value;
  }

  vm.saveKeyValue = function(prefix, index) {
    vm.catalogItemModel[prefix + "_editMode"] = false;
    vm.catalogItemModel.s_index = '';
    // delete key if key name was edited, and a add new key to hash with new name
    if (vm.catalogItemModel.original_key !== vm.catalogItemModel.key)
      delete vm.catalogItemModel[prefix + "_variables"][vm.catalogItemModel.original_key];

    vm.catalogItemModel[prefix + "_variables"][vm.catalogItemModel.key] = vm.catalogItemModel.key_value;
  }

  vm.toggleDialogSelection = function(prefix, selected_value) {
    vm.catalogItemModel[prefix + "_dialog_existing"] = selected_value;
  };

  vm.fieldsRequired = function(prefix) {
    return prefix == "provisioning";
  };

  vm.variablesEmpty = function(prefix) {
    field = vm.catalogItemModel[prefix + "_variables"];
    return Object.keys(field).length === 0;
  };

  // watch for all the drop downs on screen
  "catalog provisioning_playbook retirement_playbook provisioning_machine_credential retirement_machine_credential provisioning_network_credential retirement_network_credential provisioning_cloud_credential retirement_cloud_credential provisioning_dialog retirement_dialog".split(" ").forEach(idWatch)

  function idWatch(name) {
    field_name = "vm._" + name;
    $scope.$watch(field_name, function(value) {
      if (value)
        vm.catalogItemModel[name + '_id'] = value.id;
    });
  }

  init();
}]);
