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
      $http.get('/ansible_repository/dummy_data')
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
    // TODO go back
  };

  $scope.resetClicked = function() {
    debugger;
    vm.repositoryModel = angular.copy( vm.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  $scope.saveClicked = function() {
    $scope.angularForm.$setPristine(true);
  };

  $scope.addClicked = function() {
    // URL is different from save, maybe?
    $scope.saveClicked();
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

