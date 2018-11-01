/* global miqFlashLater */

ManageIQ.angular.app.controller('repositoryFormController', ['repositoryId', 'miqService', 'API', function(repositoryId, miqService, API) {
  var vm = this;

  var init = function() {
    vm.afterGet = false;

    vm.repositoryModel = {
      name: '',
      description: '',
      scm_type: 'git',
      scm_url: '',
      authentication_id: null,
      scm_branch: '',
      scm_clean: false,
      scm_delete_on_update: false,
      scm_update_on_launch: false,
    };

    vm.attributes = ['name', 'description', 'scm_type', 'scm_url', 'authentication_id', 'scm_branch', 'scm_clean', 'scm_delete_on_update', 'scm_update_on_launch'];
    vm.model = 'repositoryModel';

    ManageIQ.angular.scope = vm;

    vm.saveable = miqService.saveable;
    vm.newRecord = repositoryId === 'new';

    vm.scm_credentials = [{name: __('Select credentials'), value: null}];
    API.get('/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ScmCredential&expand=resources&sort_by=name&sort_order=ascending')
      .then(getCredentials)
      .catch(miqService.handleFailure);

    if (repositoryId !== 'new') {
      API.get('/api/configuration_script_sources/' + repositoryId + '?attributes=' + vm.attributes.join(','))
        .then(getRepositoryFormData)
        .catch(miqService.handleFailure);
    } else {
      API.get('/api/providers?collection_class=ManageIQ::Providers::EmbeddedAutomationManager')
        .then(getManagerResource)
        .catch(miqService.handleFailure);
    }
  };

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    var message = vm.newRecord ? __('Add of Repository cancelled by user.') : sprintf(__('Edit of Repository "%s" cancelled by user.'), vm.repositoryModel.name);
    var url = '/ansible_repository/show_list';
    miqFlashLater({
      message: message,
      level: 'warning',
    });
    window.location.href = url;
  };

  vm.resetClicked = function(angularForm) {
    vm.repositoryModel = angular.copy( vm.modelCopy );
    angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.saveClicked = function() {
    miqService.sparkleOn();
    API.put('/api/configuration_script_sources/' + repositoryId, vm.repositoryModel)
      .then(vm.getBack)
      .catch(miqService.handleFailure);
  };

  vm.addClicked = function() {
    miqService.sparkleOn();
    API.post('/api/configuration_script_sources/', vm.repositoryModel)
      .then(vm.getBack)
      .catch(miqService.handleFailure);
  };

  function setForm() {
    vm.modelCopy = angular.copy( vm.repositoryModel );
    vm.afterGet = true;
    miqService.sparkleOff();
  }

  var getRepositoryFormData = function(response) {
    var data = response;
    if ( data.hasOwnProperty( 'href' ) ) {
      delete data.href;
    }
    Object.assign(vm.repositoryModel, data);
    setForm();
  };

  vm.getBack = function(response) {
    var message = '';
    var error = false;
    if (response.hasOwnProperty('results')) {
      error = ! response.results[0].success;
      if (error) {
        message = __('Unable to add Repository ') +  vm.repositoryModel.name + ' .' +  response.results[0].message;
      } else {
        message = sprintf(__('Add of Repository "%s" was successfully initiated.'), vm.repositoryModel.name);
      }
    } else {
      error = ! response.success;
      if (error) {
        message = __('Unable to edit Repository') +  vm.repositoryModel.name + ' .' +  response.message;
      } else {
        message = sprintf(__('Edit of Repository "%s" was successfully initiated.'), vm.repositoryModel.name);
      }
    }

    var url = '/ansible_repository/show_list';
    if (error) {
      miqService.miqFlash('error', message);
      miqService.sparkleOff();
    } else {
      miqFlashLater({ message: message });
      window.location.href = url;
    }
  };

  var getCredentials = function(response) {
    response.resources.forEach( function(resource) {
      vm.scm_credentials.push({name: resource.name, value: resource.id});
    });
  };

  var getManagerResource = function(response) {
    if (! response.resources.length) {
      vm.repositoryModel.manager_resource = null;
      miqService.miqFlash('error', __('Embedded Ansible Provider not found.'));
    } else {
      vm.repositoryModel.manager_resource = {'href': response.resources[0].href};
    }
    setForm();
  };
  init();
}]);
