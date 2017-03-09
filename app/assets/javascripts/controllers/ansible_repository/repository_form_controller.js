ManageIQ.angular.app.controller('repositoryFormController', ['$http', '$scope', 'repositoryId', 'miqService', function($http, $scope, repositoryId,  miqService) {
  var vm = this;

  var init = function() {
    vm.repositoryModel = {
      name: '',
      description: '',
      scm_type: 'git',
      href: '',
      scm_credentials: '',
      scm_branch: '',
      scm_clean: false,
      scm_delete_on_update: false,
      scm_update_on_launch: false
    };

    $scope.newRecord = repositoryId == 'new';

    vm.afterGet = false;

    vm.model = 'repositoryModel';

    ManageIQ.angular.scope = vm;

    miqService.sparkleOn();
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
    getBack('Action canceled by user.', 'warning');
  };

  $scope.resetClicked = function() {
    vm.repositoryModel = angular.copy( vm.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  $scope.saveClicked = function() {
    // TODO send
    //API.put('/api/configuration_script_sources/' + repositoryId, vm.repositoryModel)
    //  .then(getBack)
    //  .catch(miqService.handleFailure);
    getBack('Repository saved', 'success');
  };

  $scope.addClicked = function() {
    // TODO send all info
    //API.post('/api/configuration_script_sources/', {name: vm.repositoryModel.name, description: vm.repositoryModel.description})
    //   .then(getBack)
    //   .catch(miqService.handleFailure);
    getBack('Repository added', 'success');
  };

  function getRepositoryFormData(response) {
    var data = response;
    Object.assign(vm.repositoryModel, data);
    vm.modelCopy = angular.copy( vm.repositoryModel );
    vm.afterGet = true;
    miqService.sparkleOff();
  }

  function getBack(message, level) {
    window.location.href = '/ansible_repository/show_list' + '?message=' + message + '&level=' + level;
  }

  init();
}]);

