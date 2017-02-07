ManageIQ.angular.app.controller('catalogItemFormController', ['$scope', 'catalogItemFormId', 'miqService', 'postService', 'API', 'catalogItemDataFactory', function($scope, catalogItemFormId, miqService, postService, API, catalogItemDataFactory) {
  var init = function() {
    $scope.catalogItemModel = {
      name: '',
      description: '',
      display: false,
      prov_type: '',
      catalog_id: '',
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
      retirement_editMode: false,
      key: '',
      key_value: '',
    };
    $scope.formId = catalogItemFormId;
    $scope.afterGet = false;
    $scope.modelCopy = angular.copy( $scope.catalogItemModel );
    $scope.model = "catalogItemModel";

    ManageIQ.angular.scope = $scope;

    if (catalogItemFormId == 'new') {
      $scope.newRecord                    = true;
      $scope.catalogItemModel.name        = '';
      $scope.catalogItemModel.description = '';
      $scope.catalogItemModel.catalog_id  = '';
      $scope.catalogItemModel.display     = false;
      $scope.catalogItemModel.provisioning_dialog_id  = '';
      $scope.catalogItemModel.retirement_dialog_id  = '';
      $scope.catalogItemModel.prov_type   = 'generic_ansible_playbook';
      $scope.formOptions();
      $scope.afterGet  = true;
      $scope.modelCopy = angular.copy( $scope.catalogItemModel );
    } else {
      $scope.newRecord = false;
      catalogItemDataFactory.getCatalogItemData(catalogItemFormId).then(function (catalogItemData) {
        $scope.newRecord = false;
        $scope.catalogItemModel.name = catalogItemData.name;
        $scope.catalogItemModel.description = catalogItemData.description;
        $scope.catalogItemModel.display = catalogItemData.display;
        $scope.catalogItemModel.catalog_id = catalogItemData.service_template_catalog_id;
        $scope.catalogItemModel.provisioning_dialog_id  = catalogItemData.provisioning_dialog_id;;
        $scope.catalogItemModel.retirement_dialog_id  = catalogItemData.retirement_dialog_id;;
        $scope.formOptions();
        $scope.afterGet = true;
        $scope.modelCopy = angular.copy($scope.catalogItemModel);
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
  $scope.formOptions = function() {
    API.get("/api/service_catalogs/?expand=resources&attributes=id,name").then(function(data) {
      $scope.catalogs = data.resources;
      $scope._catalog = _.find($scope.catalogs, {id: $scope.catalogItemModel.catalog_id})
    })

    // list of service dailaogs
    API.get("/api/service_dialogs/?expand=resources&attributes=id,label").then(function (data) {
      $scope.dialogs = data.resources
      $scope._retirement_dialog = _.find($scope.dialogs, {id: $scope.catalogItemModel.retirement_dialog_id})
      $scope._provisioning_dialog = _.find($scope.dialogs, {id: $scope.catalogItemModel.provisioning_dialog_id})
    })

    // list of repositories
    API.get("/api/configuration_script_sources/?expand=resources&attributes=id,name").then(function (data) {
      $scope.repositories = data.resources;
      $scope._retirement_repository = _.find($scope.repositories, {id: $scope.catalogItemModel.retirement_repository_id})
      $scope._provisioning_repository = _.find($scope.repositories, {id: $scope.catalogItemModel.provisioning_repository_id})
    })

    // list of machine credentials
    // check if the type of credentials can be specified in the API
    //API.get("/api/automation_manager_authentications/?expand=resources&attributes=id,name")
    API.get("/api/service_catalogs/?expand=resources&attributes=id,name").then(function (data) {
      $scope.machine_credentials = data.resources;
      $scope._retirement_machine_credential = _.find($scope.machine_credentials, {id: $scope.catalogItemModel.retirement_machine_credential_id})
      $scope._provisioning_machine_credential = _.find($scope.machine_credentials, {id: $scope.catalogItemModel.provisioning_machine_credential_id})
    })

    // list of network credentials
    // check if the type of credentials can be specified in the API
    //API.get("/api/automation_manager_authentications/?expand=resources&attributes=id,name")
     API.get("/api/service_catalogs/?expand=resources&attributes=id,name").then(function (data) {
      $scope.network_credentials = data.resources;
      $scope._retirement_network_credential = _.find($scope.network_credentials, {id: $scope.catalogItemModel.retirement_network_credential_id})
      $scope._provisioning_network_credential = _.find($scope.network_credentials, {id: $scope.catalogItemModel.provisioning_network_credential_id})
    })

    // list of cloud credentials
    // check if the type of credentials can be specified in the API
    //API.get("/api/automation_manager_authentications/?expand=resources&attributes=id,name")
    API.get("/api/service_catalogs/?expand=resources&attributes=id,name").then(function (data) {
      $scope.cloud_credentials = data.resources;
      $scope._retirement_cloud_credential = _.find($scope.cloud_credentials, {id: $scope.catalogItemModel.retirement_cloud_credential_id})
      $scope._provisioning_cloud_credential = _.find($scope.cloud_credentials, {id: $scope.catalogItemModel.provisioning_cloud_credential_id})
    })
  };

  // get playbooks for selected repository
  $scope.repositoryChanged = function(prefix, id) {

    API.get("/api/configuration_script_payload/?expand=resources&attributes=id,name").then(function(data){
    //var url = "/api/cloud_networks/" + '10000000000005' + "?attributes=cloud_subnets";
    $scope.catalogItemModel[prefix + '_playbook_id'] = '';
    $scope.catalogItemModel[prefix + '_repository_id'] = id;
    $scope[prefix + '_playbooks']  = data.resources;
    })
  };

  $scope.$watch('_provisioning_repository', function(value) {
    if (value) {
      $scope.repositoryChanged("provisioning", value.id)
    }
  });

  $scope.$watch('_retirement_repository', function(value) {
    if (value) {
      $scope.repositoryChanged("retirement", value.id)
    }
  });

  $scope.$watch('catalogItemModel.display', function(value) {
    $scope.catalogItemModel.display = value;
    return $scope.catalogItemModel.display;
  })

  $scope.addKeyValue = function(prefix) {
    $scope.catalogItemModel[prefix + "_variables"][$scope.catalogItemModel[prefix + "_key"]] =  $scope.catalogItemModel[prefix + "_value"]
    $scope.catalogItemModel[prefix + "_key"] = '';
    $scope.catalogItemModel[prefix + "_value"] = '';
  }

  $scope.provisioning_repository_selected = function() {
    return $scope.catalogItemModel.provisioning_repository_id !== '';
  }

  $scope.retirement_repository_selected = function() {
    return $scope.catalogItemModel.retirement_repository_id !== '';
  }

  $scope.provisioning_playbook_selected = function() {
    return $scope.catalogItemModel.provisioning_playbook_id !== '';
  }

  $scope.retirement_playbook_selected = function() {
    return $scope.catalogItemModel.retirement_playbook_id !== '';
  }
  $scope.removeKeyValue = function(prefix, key) {
    delete $scope.catalogItemModel[prefix + "_variables"][key];
  }

  $scope.editKeyValue = function(prefix, key, key_value, index) {
    $scope.catalogItemModel[prefix + "_editMode"] = true;
    $scope.catalogItemModel.s_index = index;
    $scope.catalogItemModel.key = key;
    $scope.catalogItemModel.key_value = key_value;
    $scope.catalogItemModel.original_key = key;
    $scope.catalogItemModel.original_key_value = key_value;
  }

  $scope.cancelKeyValue = function(prefix, key, key_value, index) {
    $scope.catalogItemModel[prefix + "_editMode"] = false;
    $scope.catalogItemModel.s_index = '';
    $scope.catalogItemModel[prefix + "_variables"][$scope.catalogItemModel.original_key] = $scope.catalogItemModel.original_key_value;
  }

  $scope.saveKeyValue = function(prefix, key, key_value, index) {
    $scope.catalogItemModel[prefix + "_editMode"] = false;
    $scope.catalogItemModel.s_index = '';
    delete $scope.catalogItemModel[prefix + "_variables"][$scope.catalogItemModel.original_key];
    $scope.catalogItemModel[prefix + "_variables"][key] = key_value;
  }

  init();
}]);
