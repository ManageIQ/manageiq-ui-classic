ManageIQ.angular.app.controller('repositoryFormController', ['$scope', 'repositoryId', 'miqService', 'API', function($scope, repositoryId,  miqService, API) {
  var vm = this;

  var init = function() {
    vm.afterGet = false;

    vm.repositoryModel = {
      name: '',
      description: '',
      scm_type: 'git',
      manager_resource: {},
      scm_url: '',
      authentication_id: null,
      scm_branch: '',
      scm_clean: false,
      scm_delete_on_update: false,
      scm_update_on_launch: false,
    };

    API.get('/api/providers?collection_class=ManageIQ::Providers::EmbeddedAutomationManager')
      .then(getManagerResource)
      .catch(miqService.handleFailure);

    vm.model = 'repositoryModel';

    ManageIQ.angular.scope = vm;

    $scope.newRecord = repositoryId === 'new';

    vm.scm_credentials = [{name: __('Select credentials'), value: null}];
    API.get('/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ScmCredential&expand=resources&sort_by=name&sort_order=ascending')
      .then(getCredentials)
      .catch(miqService.handleFailure);

    if (repositoryId !== 'new') {
      API.get('/api/configuration_script_sources/' + repositoryId)
        .then(getRepositoryFormData)
        .catch(miqService.handleFailure);
    } else {
      vm.afterGet = true;
      vm.modelCopy = angular.copy( vm.repositoryModel );
      miqService.sparkleOff();
    }
  };

  $scope.cancelClicked = function() {
    miqService.sparkleOn();
    var message = $scope.newRecord ? __('Add of Repository cancelled by user.') : sprintf(__('Edit of Repository \"%s\" cancelled by user.'), vm.repositoryModel.name);
    var url = '/ansible_repository/show_list' + '?flash_msg=' + message + '&escape=true&flash_warning=true&flash_error=false';
    window.location.href = url;
  };

  $scope.resetClicked = function() {
    vm.repositoryModel = angular.copy( vm.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  $scope.saveClicked = function() {
    miqService.sparkleOn();
    API.put('/api/configuration_script_sources/' + repositoryId, vm.repositoryModel)
      .then(getBack)
      .catch(miqService.handleFailure);
  };

  $scope.addClicked = function() {
    miqService.sparkleOn();
    API.post('/api/configuration_script_sources/', vm.repositoryModel)
      .then(getBack)
      .catch(miqService.handleFailure);
  };

  var getRepositoryFormData = function(response) {
    var data = response;
    Object.assign(vm.repositoryModel, data);
    vm.modelCopy = angular.copy( vm.repositoryModel );
    vm.afterGet = true;
    miqService.sparkleOff();
  };

  var getBack = function(response) {
    var message = '';
    var error = false;
    if (response.hasOwnProperty('results')) {
      error = ! response.results[0].success;
      if (error) {
        message = __('Unable to add Repository ') +  vm.repositoryModel.name + ' .' +  response.results[0].message;
      } else {
        message = sprintf(__('Add of Repository \"%s\" was successfully initialized.'), vm.repositoryModel.name);
      }
    } else {
      error = ! response.success;
      if (error) {
        message = __('Unable to edit Repository') +  vm.repositoryModel.name + ' .' +  response.message;
      } else {
        message = sprintf(__('Edit of Repository \"%s\" was successfully initialized.'), vm.repositoryModel.name);
      }
    }
    var url = '/ansible_repository/show_list' + '?flash_msg=' + message + '&escape=true';
    if (error) {
      miqService.miqFlash('error', message);
      miqService.sparkleOff();
    } else {
      window.location.href = url;
    }
  };

  var getCredentials = function(response) {
    response.resources.forEach( function(resource) {
      vm.scm_credentials.push({name: resource.name, value: resource.id});
    });
  };

  var getManagerResource = function(response) {
    if (!response.resources.length) {
      miqService.miqFlash('error', __('Embedded Ansible Provider not found.'));
    } else {
      vm.repositoryModel.manager_resource = {'href': response.resources[0].href};
    }
  };
  init();
}]);

