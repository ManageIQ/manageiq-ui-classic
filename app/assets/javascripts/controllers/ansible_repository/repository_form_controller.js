ManageIQ.angular.app.controller('repositoryFormController', ['$http', '$scope', 'repositoryId', 'miqService', function($http, $scope, repositoryId,  miqService) {
  var vm = this;

  var init = function() {
    vm.afterGet = false;

    vm.repositoryModel = {
      name: '',
      description: '',
      scm_type: 'git',
      manager_resource: {},
      scm_url: '',
      scm_credentials: null,
      scm_branch: '',
      scm_clean: false,
      scm_delete_on_update: false,
      scm_update_on_launch: false
    };

    API.get('/api/providers?collection_class=ManageIQ::Providers::EmbeddedAutomationManager')
      .then(getManagerResource)
      .catch(miqService.handleFailure);

    vm.model = 'repositoryModel';

    miqService.sparkleOn();

    ManageIQ.angular.scope = vm;

    $scope.newRecord = repositoryId == 'new';

    vm.scm_credentials = [{name: __("<Select credentials>"), value: null}];
    API.get('/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ScmCredential&expand=resources')
      .then(getCredentials)
      .catch(miqService.handleFailure);

    if (repositoryId != 'new') {
      API.get('/api/configuration_script_sources/' + repositoryId)
        .then(getRepositoryFormData)
        .catch(miqService.handleFailure);
    }
    else {
      vm.afterGet = true;
      vm.modelCopy = angular.copy( vm.repositoryModel );
      miqService.sparkleOff();
    }
  };

  $scope.cancelClicked = function() {
    window.location.href = '/ansible_repository/show_list?message=' + __('Action canceled by user.') + '&level=warning';
  };

  $scope.resetClicked = function() {
    vm.repositoryModel = angular.copy( vm.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  $scope.saveClicked = function() {
    API.put('/api/configuration_script_sources/' + repositoryId, vm.repositoryModel.toJSON)
      .then(getBack)
      .catch(miqService.handleFailure);
  };

  $scope.addClicked = function() {
    // TODO send all info
    API.post('/api/configuration_script_sources/', vm.repositoryModel)
       .then(getBack)
       .catch(miqService.handleFailure);
  };

  function getRepositoryFormData(response) {
    var data = response;
    Object.assign(vm.repositoryModel, data);
    vm.modelCopy = angular.copy( vm.repositoryModel );
    vm.afterGet = true;
    miqService.sparkleOff();
  }

  var getBack = function(response) {
    debugger;
    var message, level = '';
    if (response.hasOwnProperty('results')) {
      message = response.results[0].message;
      level = response.results[0].success ? 'success': 'error';
    }
    else {
      message = response.message;
      level = response.success ? 'success': 'error';
    }
    window.location.href = '/ansible_repository/show_list' + '?message=' + message + '&level=' + level;
  };

  var getCredentials = function(response) {
    response.resources.forEach( function(resource) {
      vm.scm_credentials.push({name: resource.name, value: resource.href});
    });
  };

  var getManagerResource = function(response) {
    vm.repositoryModel.manager_resource = {'href' : response.resources[0].href}
  };
  init();
}]);

