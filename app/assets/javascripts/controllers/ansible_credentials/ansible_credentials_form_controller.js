/* global miqFlashLater */

ManageIQ.angular.app.controller('ansibleCredentialsFormController', ['$window', '$q', 'credentialId', 'miqService', 'API', function($window, $q, credentialId,  miqService, API) {
  var vm = this;

  var optionsPromise = null;

  var init = function() {
    vm.credentialModel = {
      id: null,
      name: '',
      type: '',
    };

    vm.credential_options = {};
    vm.select_options = [];
    vm.deleteFromModel = [];

    vm.newRecord = credentialId === 'new';
    vm.afterGet = false;
    vm.model = 'credentialModel';
    ManageIQ.angular.scope = vm;
    vm.saveable = miqService.saveable;

    vm.storedPasswordPlaceholder = miqService.storedPasswordPlaceholder;

    miqService.sparkleOn();

    // get credential specific options for all supported credential types
    optionsPromise = API.options('/api/authentications')
      .then(getCredentialOptions)
      .catch(miqService.handleFailure);

    if (credentialId !== 'new') {
      var dataPromise = API.get('/api/authentications/' + credentialId)
        .then(getCredentialFormData)
        .catch(miqService.handleFailure);
    } else {
      vm.select_options.push({'label': __('<Choose>'), 'value': ''});
      // credential creation requires manager_resource
      API.get('/api/providers?collection_class=ManageIQ::Providers::EmbeddedAutomationManager')
        .then(setManagerResource)
        .catch(miqService.handleFailure);

      vm.modelCopy = angular.copy( vm.credentialModel );
      miqService.sparkleOff();
    }

    $q.all([optionsPromise, dataPromise])
      .then(retrievedCredentialDetails);
  };

  vm.cancelClicked = function(angularForm) {
    if (credentialId === 'new') {
      getBack(__('Creation of new Credential was canceled by the user.'), true);
    } else {
      getBack(sprintf(__('Edit of Credential "%s" was canceled by the user.'), vm.credentialModel.name), true);
    }
  };

  vm.resetClicked = function(angularForm) {
    vm.credentialModel = angular.copy( vm.modelCopy );
    angularForm.$setPristine(true);
    toggleResetFlag();
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.saveClicked = function(angularForm) {
    API.put('/api/authentications/' + credentialId, purgeModel())
      .then(getBack.bind(vm, sprintf(__('Modification of Credential "%s" has been successfully queued.'), vm.credentialModel.name), false, false))
      .catch(miqService.handleFailure);
  };

  vm.addClicked = function(angularForm) {
    API.post('/api/authentications/', vm.credentialModel)
      .then(getBack.bind(vm, sprintf(__('Add of Credential "%s" has been successfully queued.'), vm.credentialModel.name), false, false))
      .catch(miqService.handleFailure);
  };

  function purgeModel() {
    return _.omit(vm.credentialModel, vm.deleteFromModel);
  }

  function toggleResetFlag() {
    if (vm.reset) {
      vm.reset = ! vm.reset;
    } else {
      vm.reset = true;
    }
  }

  function retrievedCredentialDetails() {
    vm.afterGet = true;
    miqService.sparkleOff();
  }

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

    // we need to wait for vm.credential_options here
    optionsPromise.then(function() {
      // we need to merge options and vm.credentialModel
      Object.keys(vm.credential_options[vm.credentialModel.type].attributes).forEach(function(key) {
        var item = vm.credential_options[vm.credentialModel.type].attributes[key];

        if (item.hasOwnProperty('type') && item.type === 'password') {
          // Password fields do not get stored in the model
        } else {
          vm.credentialModel[key] = '';

          if (response.options[key]) {
            vm.credentialModel[key] = response.options[key];
          } else if (response[key]) {
            vm.credentialModel[key] = response[key];
          }
        }
      });

      vm.modelCopy = angular.copy( vm.credentialModel );
    });
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
    if (response.resources.length > 0) {
      vm.credentialModel.manager_resource = { 'href': response.resources[0].href };
    } else {
      vm.credentialModel.manager_resource = null;
      miqService.miqFlash('error', __('Embedded Ansible service is not available.'));
    }
  }

  init();
}]);
