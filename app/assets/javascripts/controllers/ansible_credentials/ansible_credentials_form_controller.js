ManageIQ.angular.app.controller('ansibleCredentialsFormController', ['$window', 'credentialId', 'miqService', 'API', function($window, credentialId,  miqService, API) {
  var vm = this;

  var init = function() {
    vm.credentialModel = {
      id: null,
      name: '',
      type: '',
    };

    vm.credential_options = {};
    vm.select_options = [];

    vm.newRecord = credentialId === 'new';
    vm.afterGet = false;
    vm.model = 'credentialModel';
    ManageIQ.angular.scope = vm;
    vm.saveable = miqService.saveable;

    miqService.sparkleOn();

    // get credential specific options for all supported credential types
    API.options('/api/authentications')
      .then(getCredentialOptions)
      .catch(miqService.handleFailure);

    if (credentialId !== 'new') {
      API.get('/api/authentications/' + credentialId)
        .then(getCredentialFormData)
        .catch(miqService.handleFailure);
    } else {
      vm.select_options.push({'label':__('<Choose>'), 'value': ''});
      // FIXME: this should go away once https://github.com/ManageIQ/manageiq/pull/14483 is merged
      vm.credentialModel.organization = 1; // work-around, organization id needs to be filled in automatically by the backend

      // credential creation requires manager_resource
      API.get('/api/providers?collection_class=ManageIQ::Providers::EmbeddedAutomationManager')
        .then(setManagerResource)
        .catch(miqService.handleFailure);

      vm.afterGet = true;
      vm.modelCopy = angular.copy( vm.credentialModel );
      miqService.sparkleOff();
    }
  };

  vm.cancelClicked = function(angularForm) {
    if (credentialId === 'new') {
      getBack(__("Creation of new Credential was canceled by the user."), true);
    } else {
      getBack(sprintf(__("Edit of Credential \"%s\" was canceled by the user."), vm.credentialModel.name), true);
    }
  };

  vm.resetClicked = function(angularForm) {
    vm.credentialModel = angular.copy( vm.modelCopy );
    angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  vm.saveClicked = function(angularForm) {
    API.put('/api/authentications/' + credentialId, vm.credentialModel)
       .then(getBack(sprintf(__("Modification of Credential \"%s\" has been successfully queued."), vm.credentialModel.name), false))
       .catch(miqService.handleFailure);
  };

  vm.addClicked = function(angularForm) {
    addCredentialKind();
    API.post('/api/authentications/', vm.credentialModel)
       .then(getBack(sprintf(__("Add of Credential \"%s\" has been successfully queued."), vm.credentialModel.name)))
       .catch(miqService.handleFailure);
  };

  function getCredentialOptions(response) {
    Object.assign(vm.credential_options, response.data.credential_types.embedded_ansible_credential_types);

    for (var opt in vm.credential_options) {
      vm.select_options.push({'value': opt, 'label': vm.credential_options[opt].label});
    }
  }

  function getCredentialFormData(response) {
    vm.credentialModel.id = response.id;
    vm.credentialModel.name = response.name;
    vm.credentialModel.type = response.type;

    // we need to merge options and vm.credentialModel
    for (var opt in response.options) {
      var item = vm.credential_options[vm.credentialModel.type]['attributes'][opt];

      // void the password fields first
      if (item.hasOwnProperty('type') && item['type'] === 'password') {
        vm.credentialModel[opt] = '';
      } else {
        vm.credentialModel[opt] = response.options[opt];
      }
    }

    vm.modelCopy = angular.copy( vm.credentialModel );
    vm.afterGet = true;
    miqService.sparkleOff();
  }

  function getBack(message, warning = false, error = false) {
    var url = '/ansible_credential/show_list' + '?flash_msg=' + message + '&escape=true';

    if (warning) {
      url += '&flash_warning=true&flash_error=false';
    } else if (error) {
      url += '&flash_warning=false&flash_error=true';
    }

    $window.location.href = url;
  }

  function setManagerResource(response) {
    vm.credentialModel.manager_resource = { "href": response.resources[0].href };
  }

  // FIXME: this should go away once https://github.com/ManageIQ/manageiq/pull/14483 is merged
  // For creation, we need to send json like: {"kind": "scm", "type": "ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ScmCredential"}
  function addCredentialKind() {
    vm.credentialModel.kind = vm.credential_options[vm.credentialModel.type].type;
  }

  init();
}]);
