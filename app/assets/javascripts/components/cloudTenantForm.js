ManageIQ.angular.app.component('cloudTenantFormComponent', {
	bindings: {
		'cloudTenantFormId': '@',
	},
	controllerAs: 'vm',
	
	
	
	controller: ['$http', 'miqService', function($http, cloudTenantFormId, miqService) {
  var vm = this;
		
  

  vm.cloudTenantModel = { name: '', ems_id: '' };
  vm.formId = cloudTenantFormId;
  vm.afterGet = false;
  vm.modelCopy = angular.copy( vm.cloudTenantModel );
  vm.model = "cloudTenantModel";
  vm.saveable = miqService.saveable;
  vm.newRecord = vm.cloudTenantFormId == 'new';
  
  

  if (vm.cloudTenantFormId == 'new') {
    vm.cloudTenantModel.name = "";
  } else {
    miqService.sparkleOn();

    $http.get('/cloud_tenant/cloud_tenant_form_fields/' + vm.cloudTenantFormId)
      .then(getCloudTenantFormDataComplete)
      .catch(miqService.handleFailure);
  }

  function getCloudTenantFormDataComplete(response) {
    var data = reponse.data;

    vm.afterGet = true;
    vm.cloudTenantModel.name = data.name;

    vm.modelCopy = angular.copy( vm.cloudTenantModel );
    miqService.sparkleOff();
  }

  vm.cancelClicked = function() {
    if (vm.cloudTenantFormId == 'new') {
      var url = '/cloud_tenant/create/new?button=cancel';
    } else {
      var url = '/cloud_tenant/update/' + vm.cloudTenantFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  vm.addClicked = function() {
    var url = '/cloud_tenant/create/new?button=add';
    miqService.miqAjaxButton(url, vm.cloudTenantModel, { complete: false });
  };

  vm.saveClicked = function() {
    var url = '/cloud_tenant/update/' + vm.cloudTenantFormId + '?button=save';
    miqService.miqAjaxButton(url, vm.cloudTenantModel, { complete: false });
  };

  vm.resetClicked = function() {
    vm.cloudTenantModel = angular.copy( vm.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", "All changes have been reset");
  };
}],
templateUrl: '/static/cloudTenantForm/cloud-tenant-form-edit.html.haml'

});
