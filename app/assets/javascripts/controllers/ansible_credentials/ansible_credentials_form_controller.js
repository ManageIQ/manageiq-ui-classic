/* global miqFlashLater */

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
      // credential creation requires manager_resource
      API.get('/api/providers?collection_class=ManageIQ::Providers::EmbeddedAutomationManager')
        .then(setManagerResource)
        .catch(miqService.handleFailure);

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
    API.post('/api/authentications/', vm.credentialModel)
       .then(getBack(sprintf(__("Add of Credential \"%s\" has been successfully queued."), vm.credentialModel.name)))
       .catch(miqService.handleFailure);
  };

  function getCredentialOptions(response) {
    Object.assign(vm.credential_options, response.data.credential_types.embedded_ansible_credential_types);

    for (var opt in vm.credential_options) {
      vm.select_options.push({'value': opt, 'label': vm.credential_options[opt].label});
    }
    vm.afterGet = true;
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

  function getBack(message, warning, error) {
    var url = '/ansible_credential/show_list';
    var flash = { message: message };

    if (warning) {
      flash.level = 'warning';
    } else if (error) {
      flash.level = 'error';
    }

    miqFlashLater(flash);
    $window.location.href = url;
  }

  function setManagerResource(response) {
    vm.credentialModel.manager_resource = { "href": response.resources[0].href };
  }

  init();
}]);
