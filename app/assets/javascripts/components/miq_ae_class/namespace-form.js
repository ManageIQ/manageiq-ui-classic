ManageIQ.angular.app.component('namespaceForm', {
  bindings: {
    'aeNsDomain': '<',
    'namespacePath': '@',
    'namespaceId': '@',
    'nameReadonly': '<',
    'descriptionReadonly': '<',
  },
  controllerAs: 'vm',
  controller: ['$scope', '$http', 'miqService', "$window", function($scope, $http, miqService, $window) {
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
      var message = vm.newRecord ? __('Add of Namespace cancelled by user.') : sprintf(__('Edit of Namespace \"%s\" cancelled by user.'), vm.namespaceModel.name);
      var url = '/miq_ae_class/explorer';
      miqFlashLater({
        message: message,
        level: 'warning',
      });
      $window.location.href = url;
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
