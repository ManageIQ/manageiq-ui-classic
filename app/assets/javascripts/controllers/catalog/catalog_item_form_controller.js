ManageIQ.angular.app.controller('catalogItemFormController', ['$scope', 'catalogItemFormId', 'miqService', 'postService', 'API', 'catalogItemDataFactory', function($scope, catalogItemFormId, miqService, postService, API, catalogItemDataFactory) {
  var vm = this;
  var init = function() {
    vm.catalogItemModel = {
      name: '',
      description: '',
      display: false,
      prov_type: '',
      catalog_id: '',
      key: '',
      key_value: '',
      provisioning_repository_id: '',
      provisioning_playbook_id: '',
      provisioning_machine_credential_id: '',
      provisioning_netowrk_credential_id: '',
      provisioning_cloud_credential_id: '',
      provisioning_inventory: 'localhost',
      provisioning_dialog_existing: 'existing',
      provisioning_dialog_id: '',
      provisioning_dialog_name: '',
      provisioning_key: '',
      provisioning_value: '',
      provisioning_variables: {"p_var1": "p_val1", "p_var2": "p_val2"},
      provisioning_editMode: false,
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
      retirement_variables: {"r_var1": "r_val1", "r_var2": "r_val2"},
      retirement_editMode: false
    };
    vm.formId = catalogItemFormId;
    vm.afterGet = false;
    vm.modelCopy = angular.copy( vm.catalogItemModel );
    vm.model = "catalogItemModel";

    ManageIQ.angular.scope = $scope;

    if (catalogItemFormId == 'new') {
      vm.newRecord                    = true;
      vm.catalogItemModel.name        = '';
      vm.catalogItemModel.description = '';
      vm.catalogItemModel.catalog_id  = '';
      vm.catalogItemModel.display     = false;
      vm.catalogItemModel.provisioning_dialog_id  = '';
      vm.catalogItemModel.retirement_dialog_id  = '';
      vm.catalogItemModel.prov_type   = 'generic_ansible_playbook';
      vm.formOptions();
      vm.afterGet  = true;
      vm.modelCopy = angular.copy( vm.catalogItemModel );
    } else {
      vm.newRecord = false;
      catalogItemDataFactory.getCatalogItemData(catalogItemFormId).then(function (catalogItemData) {
        vm.newRecord = false;
        vm.catalogItemModel.name = catalogItemData.name;
        vm.catalogItemModel.description = catalogItemData.description;
        vm.catalogItemModel.display = catalogItemData.display;
        vm.catalogItemModel.catalog_id = catalogItemData.service_template_catalog_id;
        vm.catalogItemModel.provisioning_dialog_id  = catalogItemData.provisioning_dialog_id;;
        vm.catalogItemModel.retirement_dialog_id  = catalogItemData.retirement_dialog_id;;
        vm.formOptions();
        vm.afterGet = true;
        vm.modelCopy = angular.copy(vm.catalogItemModel);
      });
    }
  };

  var catalogItemEditButtonClicked = function(buttonName, serializeFields) {
    miqService.sparkleOn();
    var url = '/catalog/catalog_item_edit/' + catalogItemFormId + '?button=' + buttonName;
    if (serializeFields === undefined) {
      miqService.miqAjaxButton(url);
    } else {
      miqService.miqAjaxButton(url, serializeFields);
    }
  };

  $scope.cancelClicked = function() {
    catalogItemEditButtonClicked('cancel');
    $scope.angularForm.$setPristine(true);
  };

  $scope.resetClicked = function() {
    $scope.catalogItemModel = angular.copy( $scope.modelCopy );
    $scope.angularForm.$setUntouched(true);
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  $scope.saveClicked = function() {
    catalogItemEditButtonClicked('save', true);
    $scope.angularForm.$setPristine(true);
  };

  $scope.addClicked = function() {
    $scope.saveClicked();
  };

  // list of service catalogs
  vm.formOptions = function() {
    API.get("/api/service_catalogs/?expand=resources&attributes=id,name").then(function(data) {
      vm.catalogs = data.resources;
      vm._catalog = _.find(vm.catalogs, {id: vm.catalogItemModel.catalog_id})
    })

    // list of service dailaogs
    API.get("/api/service_dialogs/?expand=resources&attributes=id,label").then(function (data) {
      vm.dialogs = data.resources
      vm._retirement_dialog = _.find(vm.dialogs, {id: vm.catalogItemModel.retirement_dialog_id})
      vm._provisioning_dialog = _.find(vm.dialogs, {id: vm.catalogItemModel.provisioning_dialog_id})
    })

    // list of repositories
    API.get("/api/configuration_script_sources/?expand=resources&attributes=id,name").then(function (data) {
      vm.repositories = data.resources;
      vm._retirement_repository = _.find(vm.repositories, {id: vm.catalogItemModel.retirement_repository_id})
      vm._provisioning_repository = _.find(vm.repositories, {id: vm.catalogItemModel.provisioning_repository_id})
    })

    // list of machine credentials
    // check if the type of credentials can be specified in the API
    //API.get("/api/automation_manager_authentications/?expand=resources&attributes=id,name")
    API.get("/api/service_catalogs/?expand=resources&attributes=id,name").then(function (data) {
      vm.machine_credentials = data.resources;
      vm._retirement_machine_credential = _.find(vm.machine_credentials, {id: vm.catalogItemModel.retirement_machine_credential_id})
      vm._provisioning_machine_credential = _.find(vm.machine_credentials, {id: vm.catalogItemModel.provisioning_machine_credential_id})
    })

    // list of network credentials
    // check if the type of credentials can be specified in the API
    //API.get("/api/automation_manager_authentications/?expand=resources&attributes=id,name")
     API.get("/api/service_catalogs/?expand=resources&attributes=id,name").then(function (data) {
      vm.network_credentials = data.resources;
      vm._retirement_network_credential = _.find(vm.network_credentials, {id: vm.catalogItemModel.retirement_network_credential_id})
      vm._provisioning_network_credential = _.find(vm.network_credentials, {id: vm.catalogItemModel.provisioning_network_credential_id})
    })

    // list of cloud credentials
    // check if the type of credentials can be specified in the API
    //API.get("/api/automation_manager_authentications/?expand=resources&attributes=id,name")
    API.get("/api/service_catalogs/?expand=resources&attributes=id,name").then(function (data) {
      vm.cloud_credentials = data.resources;
      vm._retirement_cloud_credential = _.find(vm.cloud_credentials, {id: vm.catalogItemModel.retirement_cloud_credential_id})
      vm._provisioning_cloud_credential = _.find(vm.cloud_credentials, {id: vm.catalogItemModel.provisioning_cloud_credential_id})
    })
  };

  // get playbooks for selected repository
  vm.repositoryChanged = function(prefix, id) {
    API.get("/api/configuration_script_sources/" + id + "?attributes=configuration_script_payloads").then(function(data){
      vm.catalogItemModel[prefix + '_playbook_id'] = '';
      vm.catalogItemModel[prefix + '_repository_id'] = id;
      vm[prefix + '_playbooks']  = data.configuration_script_payloads;
    })
  };

  $scope.$watch('vm._provisioning_repository', function(value) {
    if (value) {
      vm.repositoryChanged("provisioning", value.id)
    } else
      vm.catalogItemModel['provisioning_repository_id'] = ''
  });

  $scope.$watch('vm._retirement_repository', function(value) {
    if (value) {
      vm.repositoryChanged("retirement", value.id)
    } else
      vm.catalogItemModel['retirement_repository_id'] = ''
  });

  $scope.$watch('vm.catalogItemModel.display', function(value) {
    vm.catalogItemModel.display = value;
    return vm.catalogItemModel.display;
  })

  vm.addKeyValue = function(prefix) {
    vm.catalogItemModel[prefix + "_variables"][vm.catalogItemModel[prefix + "_key"]] =  vm.catalogItemModel[prefix + "_value"]
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

  vm.cancelKeyValue = function(prefix, key, key_value, index) {
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
    vm.catalogItemModel[prefix + "_dialog_existing"] = selected_value
  };

  vm.fieldsRequired = function(prefix) {
    return prefix == "provisioning";
  };

  $scope.cancelClicked = function() {
    catalogItemEditButtonClicked('cancel');
    $scope.angularForm.$setPristine(true);
  };

  $scope.resetClicked = function() {
    vm.catalogItemModel = angular.copy( vm.modelCopy );
    $scope.angularForm.$setUntouched(true);
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  $scope.saveClicked = function() {
    catalogItemEditButtonClicked('save', true);
    $scope.angularForm.$setPristine(true);
  };

  $scope.addClicked = function() {
    $scope.saveClicked();
  };

  init();
}]);
