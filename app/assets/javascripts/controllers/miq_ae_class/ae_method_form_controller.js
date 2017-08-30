ManageIQ.angular.app.controller('aeMethodFormController', ['$http', '$scope', 'aeMethodFormId', 'currentRegion', 'miqService', 'postService', 'API', function($http, $scope, aeMethodFormId, currentRegion, miqService, postService, API) {
  var vm = this;
  var sort_options = "&sort_by=name&sort_order=ascending"
  var init = function() {
    vm.aeMethodModel = {
      name: '',
      display_name: '',
      location: '',
      namespace_path: '',
      class_id:'',
      language:'',
      scope:'',
      key: '',
      key_value: '',
      provisioning_repository_id: '',
      provisioning_playbook_id: '',
      provisioning_machine_credential_id: '',
      provisioning_network_credential_id: '',
      provisioning_cloud_credential_id: '',
      provisioning_inventory: 'localhost',
      provisioning_key: '',
      provisioning_value: '',
      provisioning_variables: {},
      provisioning_verbosity: '0',
      provisioning_editMode: false,
    };
    getVerbosityTypes();
    vm.provisioning_cloud_type = '';
    vm.currentRegion = currentRegion;
    vm.formId = aeMethodFormId;
    vm.afterGet = false;
    vm.model = "aeMethodModel";

    ManageIQ.angular.scope = $scope;

    $http.get('method_form_fields/' + aeMethodFormId)
      .then(getMethodFormData)
      .catch(miqService.handleFailure);

    if (aeMethodFormId == 'new') {
      $scope.newRecord = true;
      vm.formOptions();
      vm.formCloudCredentials(null, null);
    } else {
      vm.newRecord = false;
      $scope.newRecord = false;
    }
    vm.afterGet = true;

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
    vm.formOptions();
    vm.formCloudCredentials(data.cloud_credential_id);
    getConfigInfo(data['config_info']);
    vm.modelCopy = angular.copy(vm.aeMethodModel);
  }

  var getVerbosityTypes = function() {
    vm['verbosity_types'] = {
      "0": "0 (Normal)",
      "1": "1 (Verbose)",
      "2": "2 (More Verbose)",
      "3": "3 (Debug)",
      "4": "4 (Connection Debug)",
      "5": "5 (WinRM Debug)"
    };
  }

  var getCredentialType = function (credentialId) {
    var url = '/api/authentications/' + credentialId;
    API.get(url).then(function (data) {
      vm.provisioning_cloud_type = data.type;

      if (vm.cloud_types[vm.provisioning_cloud_type] !== 'undefined') {
        vm['_provisioning_cloud_type'] = data.type;
        getCloudCredentialsforType(data.type);
      }
    })
  };

  var setIfDefined = function(value) {
    return (typeof value !== 'undefined') ? value : '';
  };

  var getConfigInfo = function (configData) {
    vm.aeMethodModel.provisioning_repository_id = configData['repository_id'];
    vm.aeMethodModel.provisioning_playbook_id = configData['playbook_id'];
    vm.aeMethodModel.provisioning_machine_credential_id = configData['credential_id'];
    vm.aeMethodModel.provisioning_network_credential_id = configData['network_credential_id'];
    vm.aeMethodModel.provisioning_cloud_credential_id = setIfDefined(configData['cloud_credential_id']);
    vm.aeMethodModel.provisioning_inventory = configData['hosts'];
    vm.aeMethodModel.provisioning_key = '';
    vm.aeMethodModel.provisioning_value = '';

    if (configData['verbosity'] === undefined) {
      vm.aeMethodModel.provisioning_verbosity = '0';
    } else {
      vm.aeMethodModel.provisioning_verbosity = configData['verbosity'];
    }

    setExtraVars('provisioning_variables', configData['extra_vars']);
  };

  var setExtraVars = function (variableName, extraVars) {
    if (typeof extraVars !== 'undefined') {
      vm.aeMethodModel[variableName] = {};
      for (var key in extraVars) {
        vm.aeMethodModel[variableName][key] = extraVars[key];
      }
    }
    $scope.checkFormPristine();
  }

  $scope.resetClicked = function() {
    vm.aeMethodModel = angular.copy(vm.modelCopy);
    vm.formOptions();
    cloudCredentialsList(vm.aeMethodModel.cloud_credential_id);
    $scope.angularForm.$setUntouched(true);
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  var methodEditButtonClicked = function(buttonName) {
    miqService.sparkleOn();
    var url = '/miq_ae_class/add_update_method/' + aeMethodFormId + '?button=' + buttonName;
    miqService.miqAjaxButton(url, setConfigInfo(vm.aeMethodModel))
  };

  $scope.cancelClicked = function() {
    methodEditButtonClicked('cancel');
    $scope.angularForm.$setPristine(true);
  };

  $scope.saveClicked = function() {
    methodEditButtonClicked('save');
    $scope.angularForm.$setPristine(true);
  };

  $scope.addClicked = function() {
    methodEditButtonClicked('add');
    $scope.angularForm.$setPristine(true);
  };

  var formatExtraVars = function(extraVars){
    if (typeof extraVars !== 'undefined') {
      formattedExtraVars = {};
      for (var key in extraVars) {
        formattedExtraVars[key] =  extraVars[key];
      }
    }
    return formattedExtraVars;
  }

  var setConfigInfo = function(configData) {
    alert(JSON.stringify(configData))
    method = {
      name: configData["name"],
      display_name: configData["display_name"],
      class_id: configData["class_id"],
      language: configData["language"],
      scope: configData["scope"],
      location: "playbook",
      repository_id: configData["provisioning_repository_id"],
      playbook_id: configData["provisioning_playbook_id"],
      credential_id: configData["provisioning_machine_credential_id"],
      hosts: configData["provisioning_inventory"],
      verbosity: configData["provisioning_verbosity"],
      extra_vars: formatExtraVars(configData["provisioning_variables"])
    }
    if (configData["provisioning_network_credential_id"] !== '')
      method['network_credential_id'] = configData["provisioning_network_credential_id"];

    if (configData["provisioning_cloud_credential_id"] !== '')
      method['cloud_credential_id'] = configData["provisioning_cloud_credential_id"];
    return method;
  }


  // list of service catalogs
  vm.formOptions = function() {
    // list of repositories
    API.get("/api/configuration_script_sources?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ConfigurationScriptSource&expand=resources&attributes=id,name&filter[]=region_number=" + vm.currentRegion + sort_options).then(function(data) {
      vm.repositories = data.resources;
      vm._provisioning_repository = _.find(vm.repositories, {id: vm.aeMethodModel.provisioning_repository_id});
    })

    // list of machine credentials
    API.get("/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::MachineCredential&expand=resources&attributes=id,name" + sort_options).then(function(data) {
      vm.machine_credentials = data.resources;
      vm._provisioning_machine_credential = _.find(vm.machine_credentials, {id: vm.aeMethodModel.provisioning_machine_credential_id});
    })

    // list of network credentials
    API.get("/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::NetworkCredential&expand=resources&attributes=id,name" + sort_options).then(function(data) {
      vm.network_credentials = data.resources;
      vm._provisioning_network_credential = _.find(vm.network_credentials, {id: vm.aeMethodModel.provisioning_network_credential_id});
    })
  };

  // list of cloud credentials
  vm.formCloudCredentials = function(provisionCredentialId) {
    API.options('/api/authentications').then(function(data) {
      var cloud_types = {};
      angular.forEach(data.data.credential_types.embedded_ansible_credential_types, function(cred_object, cred_type) {
        if (cred_object.type == 'cloud')
          cloud_types[cred_type] = cred_object.label;
      });
      vm.cloud_types = getSortedHash(cloud_types);
      cloudCredentialsList(provisionCredentialId);
    });
  };

  var cloudCredentialsList = function(provisionCredentialId) {
    if (provisionCredentialId) {
      getCredentialType('provisioning', provisionCredentialId);
    } else {
      vm._provisioning_cloud_type = '';
      vm._provisioning_cloud_credential_id = '';
    }
  };

  var getSortedHash = function(inputHash) {
    var sortedHash = Object.keys(inputHash)
      .map(function(key) {
        return ({"k": key, "v": inputHash[key]})
      })
      .sort(function(a, b) {
        return a.v.localeCompare(b.v)
      })
      .reduce(function(o, e) {
        o[e.k] = e.v;
        return o;
      }, {});
    return sortedHash;
  };

  // get playbooks for selected repository
  vm.repositoryChanged = function(id) {
    API.get("/api/configuration_script_sources/" + id + "/configuration_script_payloads?expand=resources&filter[]=region_number=" + vm.currentRegion + sort_options).then(function (data) {
      vm.provisioning_playbooks = data.resources;
      // if repository has changed
      if (id !== vm.aeMethodModel.provisioning_repository_id) {
        vm.aeMethodModel.provisioning_playbook_id = '';
        vm.aeMethodModel.provisioning_repository_id = id;
        getRemoveResourcesTypes();
      } else {
        findObjectForDropDown('_playbook', '_playbooks');
      }
    })
  };

  $scope.$watch('vm._provisioning_repository', function(value) {
    if (value) {
      vm.repositoryChanged(value.id)
    } else {
      vm.aeMethodModel['provisioning_repository_id'] = '';
    }
    $scope.checkFormPristine();
  });

  $scope.checkFormPristine = function() {
    if (angular.equals(vm.aeMethodModel, vm.modelCopy)) {
      $scope.angularForm.$setPristine();
    } else {
      $scope.angularForm.$setDirty();
    }
  };

  $scope.cloudTypeChanged = function(value) {
    var valueChanged = (value !== vm.provisioning_cloud_type);
    if (value) {
      vm.provisioning_cloud_type = value;
    } else {
      vm.provisioning_cloud_type = '';
    }
    if (valueChanged) {
      var typ = vm.provisioning_cloud_type;
      vm.aeMethodModel.provisioning_cloud_credential_id = '';
      getCloudCredentialsforType(typ);
    }
    $scope.checkFormPristine();
  };

  vm.fieldsRequired = function(prefix) {
    return prefix === 'provisioning';
  };

  var getCloudCredentialsforType = function(typ) {
    // list of cloud credentials based upon selected cloud type
    var url = '/api/authentications?collection_class=' + typ + '&expand=resources&attributes=id,name' + sort_options;
    API.get(url).then(function(data) {
      vm.provisioning_cloud_credentials = data.resources;
      findObjectForDropDown('provisioning_cloud_credential', '_cloud_credentials');
    })
  };

  var findObjectForDropDown = function(fieldName, listName) {
    vm['_provisioning' + fieldName] = _.find(vm['provisioning' + listName], {id: vm.aeMethodModel['provisioning' + fieldName + '_id']});
    $scope.checkFormPristine();
  };

  $scope.$watch('vm._provisioning_cloud_type', function(value) {
    $scope.cloudTypeChanged(value);
  })

  vm.addKeyValue = function() {
    vm.aeMethodModel.provisioning_variables[vm.aeMethodModel.provisioning_key] =  vm.aeMethodModel.provisioning_value;
    vm.aeMethodModel.provisioning_key = '';
    vm.aeMethodModel.provisioning_value = '';
  }

  vm.provisioning_repository_selected = function() {
    return vm.aeMethodModel.provisioning_repository_id !== '';
  }

  vm.removeKeyValue = function(key) {
    delete vm.aeMethodModel.provisioning_variables[key];
    $scope.checkFormPristine();
  }

  vm.editKeyValue = function(key, key_value, index) {
    vm.aeMethodModel.provisioning_editMode = true;
    vm.aeMethodModel.s_index = index;
    vm.aeMethodModel.key = key;
    vm.aeMethodModel.key_value = key_value;
    vm.aeMethodModel.original_key = key;
    vm.aeMethodModel.original_key_value = key_value;
  }

  vm.cancelKeyValue = function() {
    vm.aeMethodModel.provisioning_editMode = false;
    vm.aeMethodModel.s_index = '';
    vm.aeMethodModel.provisioning_variables[vm.aeMethodModel.original_key] = vm.aeMethodModel.original_key_value;
  }

  vm.saveKeyValue = function(index) {
    vm.aeMethodModel.provisioning_editMode = false;
    vm.aeMethodModel.s_index = '';
    // delete key if key name was edited, and a add new key to hash with new name
    if (vm.aeMethodModel.original_key !== vm.aeMethodModel.key)
      delete vm.aeMethodModel.provisioning_variables[vm.aeMethodModel.original_key];

    vm.aeMethodModel.provisioning_variables[vm.aeMethodModel.key] = vm.aeMethodModel.key_value;
  }

  vm.variablesEmpty = function() {
    field = vm.aeMethodModel.provisioning_variables;
    return Object.keys(field).length === 0;
  };

  // watch for all the drop downs on screen
  "provisioning_playbook provisioning_machine_credential provisioning_network_credential provisioning_cloud_credential".split(" ").forEach(idWatch)

  function idWatch(name) {
    field_name = "vm._" + name;
    $scope.$watch(field_name, function(value) {
      if (value)
        vm.aeMethodModel[name + '_id'] = value.id;
      $scope.checkFormPristine();
    });
  }

  init();
}]);
