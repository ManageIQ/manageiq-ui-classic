ManageIQ.angular.app.controller('repositoryFormController', ['$http', '$scope', 'repositoryId', 'miqService', function($http, $scope, repositoryId,  miqService) {
  var vm = this;

  var init = function() {
    vm.repositoryModel = {
      name: '',
      description: '',
      scm_type: 'git',
      url: '',
      scm_credentials: '',
      branch: '',
      clean: false,
      deleteOnUpdate: false,
      updateOnLaunch: false,
    };

    vm.afterGet = false;

    vm.model = 'repositoryModel';
    vm.newRecord = false;

    ManageIQ.angular.scope = vm;

    miqService.sparkleOn();
    // TODO change to API
    if (repositoryId != 'new') {
      $http.get('/api/configuration_script_sources/' + repositoryId)
        .then(getRepositoryFormData)
        .catch(miqService.handleFailure);
    }
    else {
      vm.afterGet = true;
      vm.modelCopy = angular.copy( vm.repositoryModel );
      miqService.sparkleOff();
    }

  };
  vm.newRecord = function() {
    return repositoryId == 'new';
  };

  $scope.newRecord = function() {
    return repositoryId == 'new';
  };

  $scope.saveable = function(angularForm) {
    // TODO
    return true;
  };

  $scope.cancelClicked = function() {
    // TODO go back
    miqService.miqAjaxButton('/ansible_repository/show_list');
  };

  $scope.resetClicked = function() {
    debugger;
    vm.repositoryModel = angular.copy( vm.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  $scope.saveClicked = function() {
    // TODO correct object redirect back
    API.put('/api/configuration_script_sources/' + repositoryId, {name: 'fooo'})
      .then(getRepositoryFormData)
      .catch(miqService.handleFailure);
  };

  $scope.addClicked = function() {
    // TODO correct object redirect back to list view
    API.post('/api/configuration_script_sources', {name: 'fooo'})
       .then(getRepositoryFormData)
       .catch(miqService.handleFailure);
  };

  function getRepositoryFormData(response) {
    var data = response.data;
    Object.assign(vm.repositoryModel, data);
    vm.modelCopy = angular.copy( vm.repositoryModel );
    vm.afterGet = true;
    miqService.sparkleOff();
  }

  init();
}]);

