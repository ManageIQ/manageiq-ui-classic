ManageIQ.angular.app.controller('cloudTenantFormController', ['$http', '$scope', 'cloudTenantFormId', 'miqService', function($http, $scope, cloudTenantFormId, miqService) {
  var vm = this;

  vm.cloudTenantModel = { name: '', ems_id: '' };
  vm.formId = cloudTenantFormId;
  vm.afterGet = false;
  vm.modelCopy = angular.copy( vm.cloudTenantModel );
  vm.model = 'cloudTenantModel';
  vm.saveable = miqService.saveable;
  vm.newRecord = cloudTenantFormId === 'new';

  ManageIQ.angular.scope = $scope;

  if (cloudTenantFormId === 'new') {
    vm.cloudTenantModel.name = '';
  } else {
    miqService.sparkleOn();

    $http.get('/cloud_tenant/cloud_tenant_form_fields/' + cloudTenantFormId)
      .then(getCloudTenantFormDataComplete)
      .catch(miqService.handleFailure);
  }

  function getCloudTenantFormDataComplete(response) {
    var data = response.data;

    vm.afterGet = true;
    vm.cloudTenantModel.name = data.name;

    vm.modelCopy = angular.copy( vm.cloudTenantModel );
    miqService.sparkleOff();
  }

  vm.cancelClicked = function() {
    var url;
    if (cloudTenantFormId === 'new') {
      url = '/cloud_tenant/create/new?button=cancel';
    } else {
      url = '/cloud_tenant/update/' + cloudTenantFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  vm.addClicked = function() {
    var url = '/cloud_tenant/create/new?button=add';
    miqService.miqAjaxButton(url, vm.cloudTenantModel, { complete: false });
  };

  vm.saveClicked = function() {
    var url = '/cloud_tenant/update/' + cloudTenantFormId + '?button=save';
    miqService.miqAjaxButton(url, vm.cloudTenantModel, { complete: false });
  };

  vm.resetClicked = function() {
    vm.cloudTenantModel = angular.copy( vm.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };
}]);
