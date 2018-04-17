ManageIQ.angular.app.component('vmCloudResizeForm',{
	controller: vmCloudResizeFormController,
	controllerAs: 'vm',
	templateUrl: '/static/resize.html.haml',
	bindings: {
		'id': '@',
	}
});

vmCloudResizeFormController.$inject = ['miqService', 'API', 'explorer', 'recordFlavorName'];

function vmCloudResizeFormController(miqService, API, explorer, recordFlavorName) {
  var vm = this;
  

  var init = function() {
    vm.explorer = explorer;
    vm.recordFlavorName = recordFlavorName;
    vm.vmCloudModel = {
      flavor_id: null,
    };
    vm.flavors = [];
    vm.formId = vmCloudResizeFormId;
    vm.modelCopy = angular.copy(vm.vmCloudModel);

    ManageIQ.angular.scope = vm;

    $http.get('/vm_cloud/resize_form_fields/' + vmCloudResizeFormId)
      .then(getResizeFormData)
      .catch(miqService.handleFailure);
  };

  $scope.cancelClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/resize_vm/' + vmCloudResizeFormId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  $scope.submitClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/resize_vm/' + vmCloudResizeFormId + '?button=submit';
    miqService.miqAjaxButton(url, vm.vmCloudModel);
  };

  function getResizeFormData(response) {
    var data = response.data;
    Object.assign(vm, data);
    miqService.sparkleOff();
  };

  init();

	vm.$onInit = init;
}
