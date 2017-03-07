ManageIQ.angular.app.controller('repositoryFormController', ['$http', '$scope', 'repositoryId', 'miqService', function($http, $scope, repositoryId,  miqService) {
  var vm = this;

  var init = function() {
    vm.repositoryModel = {
      name: '',
      description: '',
      scm_type: 'git',
      href: '',
      scm_credentials: '',
      branch: '',
      clean: false,
      deleteOnUpdate: false,
      updateOnLaunch: false
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
    getBack();
  };

  $scope.resetClicked = function() {
    vm.repositoryModel = angular.copy( vm.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  $scope.saveClicked = function() {
    API.put('/api/configuration_script_sources/' + repositoryId, vm.repositoryModel)
      .then(getBack)
      .catch(miqService.handleFailure);
  };

  $scope.addClicked = function() {
    API.post('/api/configuration_script_sources', vm.repositoryModel)
       .then(getBack)
       .catch(miqService.handleFailure);
  };

  function getRepositoryFormData(response) {
    var data = response.data;
    Object.assign(vm.repositoryModel, data);
    vm.modelCopy = angular.copy( vm.repositoryModel );
    vm.afterGet = true;
    miqService.sparkleOff();
  }

  function getBack() {
    // TODO add flash message
    window.location.href = '/ansible_repository/show_list';
  }

  init();
}]);

