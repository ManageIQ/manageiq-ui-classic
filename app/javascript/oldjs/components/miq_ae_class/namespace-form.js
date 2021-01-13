ManageIQ.angular.app.component('namespaceForm', {
  bindings: {
    'aeNsDomain': '<',
    'namespacePath': '@',
    'namespaceId': '@',
    'nameReadonly': '<',
    'descriptionReadonly': '<',
  },
  controllerAs: 'vm',
  controller: ['$scope', '$http', 'miqService', '$window', function($scope, $http, miqService, $window) {
    $scope.__ = __;
    $scope.controllerName = 'vm';

    var vm = this;

    this.$onInit = function() {
      vm.saveable = miqService.saveable;
      vm.newRecord = vm.namespaceId === 'new';

      vm.model = 'namespaceModel';
      vm.namespaceModel = {
        name: '',
        description: '',
      };

      if (vm.aeNsDomain) {
        vm.namespaceModel.enabled = true;
      }

      vm.afterGet = false;
      if (vm.namespaceId === 'new') {
        vm.afterGet = true;
        miqService.sparkleOff();
        vm.modelCopy = angular.copy( vm.namespaceModel );
      } else {
        $http.get('/miq_ae_class/namespace/' + vm.namespaceId)
          .then(getNamespace)
          .catch(miqService.handleFailure);
      }
    };

    var getNamespace = function(response) {
      Object.assign(vm.namespaceModel, response.data);
      vm.modelCopy = angular.copy( vm.namespaceModel );
      vm.afterGet = true;
      miqService.sparkleOff();
    };

    vm.cancelClicked = function() {
      miqService.sparkleOn();
      var message = '';
      if (vm.newRecord) {
        message = vm.aeNsDomain ? __('Add of Domain was cancelled by user.') : __('Add of Namespace was cancelled by user.');
      } else {
        message = vm.aeNsDomain ? __('Edit of Domain "%s" was cancelled by user.') : __('Edit of Namespace "%s" was cancelled by user.');
        message = sprintf(message, vm.namespaceModel.name);
      }
      miqFlashLater({
        message: message,
        level: 'warning',
      });
      $window.location.href = '/miq_ae_class/explorer';
    };

    vm.resetClicked = function(angularForm) {
      vm.namespaceModel = angular.copy( vm.modelCopy );
      angularForm.$setPristine(true);
      miqService.miqFlash('warn', __('All changes have been reset'));
    };

    vm.saveClicked = function() {
      var url = '/miq_ae_class/update_namespace/' + vm.namespaceId + '?button=save';
      miqService.miqAjaxButton(url, vm.namespaceModel, { complete: false });
    };

    vm.addClicked = function() {
      var url = '/miq_ae_class/create_namespace/new?button=add';
      miqService.miqAjaxButton(url, vm.namespaceModel, { complete: false });
    };
  }],
  templateUrl: '/static/miq_ae_class/namespace_form.html.haml',
});
