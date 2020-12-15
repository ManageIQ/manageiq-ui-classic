ManageIQ.angular.app.component('logCollectionForm', {
  controllerAs: 'vm',
  controller: logCollectionFormController,
  templateUrl: '/static/ops/log_collection/log_collection.html.haml',
  bindings: {
    'recordId': '@',
    'selectOptions': '<',
    'uriPrefixes': '<',
    'logCollectionFormFieldsUrl': '@',
    'saveUrl': '@',
    'message': '@',
  },

});

logCollectionFormController.$inject = ['$http', '$scope', 'miqService', 'miqDBBackupService'];
function logCollectionFormController($http, $scope, miqService, miqDBBackupService) {
  var vm = this;
  var init = function() {
    vm.logCollectionModel = {
      depot_name: '',
      uri: '',
      uri_prefix: '',
      log_protocol: '',
      log_userid: '',
      log_password: '',
    };
    vm.saveable = miqService.saveable;
    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.logCollectionModel );
    vm.prefix = 'log';
    vm.model = 'logCollectionModel';
    vm.miqDBBackupService = miqDBBackupService;
    ManageIQ.angular.scope = $scope;

    if (vm.recordId === 'new') {
      vm.logCollectionModel.depot_name = '';
      vm.logCollectionModel.uri = '';
      vm.logCollectionModel.uri_prefix = '';
      vm.logCollectionModel.log_userid = '';
      vm.logCollectionModel.log_password = '';
      vm.logCollectionModel.log_protocol = '';
      vm.modelCopy = angular.copy( vm.logCollectionModel );
    } else {
      vm.newRecord = false;

      miqService.sparkleOn();

      var url = vm.logCollectionFormFieldsUrl;
      $http.get(url + vm.recordId)
        .then(getLogCollectionFormData)
        .catch(miqService.handleFailure);
    }
  };

  vm.validateClicked = function() {
    miqService.validateWithAjax(vm.saveUrl + '?button=validate&type=' + vm.prefix, vm.logCollectionModel);
  };

  vm.logProtocolChanged = function() {
    miqService.sparkleOn();
    miqDBBackupService.resetAll(vm.logCollectionModel);
    vm.logCollectionModel.uri_prefix = vm.uriPrefixes[vm.logCollectionModel.log_protocol];
    $scope.$broadcast('reactiveFocus');
    miqService.sparkleOff();
  }

  vm.isBasicInfoValid = function() {
    return $scope.angularForm.depot_name.$valid &&
      $scope.angularForm.uri.$valid;
  };

  vm.saveClicked = function() {
    miqService.sparkleOn();
    var url = vm.saveUrl + vm.recordId + '?button=save';
    var moreUrlParams = $.param(miqService.serializeModel(vm.logCollectionModel));
    if (moreUrlParams) {
      url += '&' + decodeURIComponent(moreUrlParams);
    }
    miqService.miqAjaxButton(url, false);
  };

  vm.resetClicked = function(angularForm) {
    $scope.$broadcast('resetClicked');
    vm.logCollectionModel = angular.copy( vm.modelCopy );
    angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    var url = vm.saveUrl + vm.recordId + '?button=cancel';
    miqService.miqAjaxButton(url, true);
  };

  vm.canValidateBasicInfo = function() {
    return vm.isBasicInfoValid();
  };

  function getLogCollectionFormData(response) {
    var data = response.data;

    vm.logCollectionModel = angular.copy(data);

    if (vm.logCollectionModel.log_userid !== '') {
      vm.logCollectionModel.log_password = miqService.storedPasswordPlaceholder;
    }

    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.logCollectionModel );

    miqService.sparkleOff();
  }

  vm.$onInit = init;
}
