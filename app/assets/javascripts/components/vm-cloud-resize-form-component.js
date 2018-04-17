ManageIQ.angular.app.component('vmCloudResizeForm',{
	controller: vmCloudResizeFormController,
	controllerAs: 'vm',
	templateUrl: '/static/resize.html.haml',
	bindings: {
		'id': '@',
	}
});

vmCloudResizeFormController.$inject = ['miqService', 'API', 'explorer', 'recordFlavorName', '$scope', '$http'];

function vmCloudResizeFormController(miqService, API, explorer, recordFlavorName, $scope, $http) {
  var vm = this;
  

  var init = function() {

    vm.explorer = explorer;
    vm.recordFlavorName = recordFlavorName;
    vm.vmCloudModel = {
      flavor_id: null,
    };
    vm.flavors = [];
    vm.formId = vm.id;
    vm.modelCopy = angular.copy(vm.vmCloudModel);

    ManageIQ.angular.scope = vm;

    $http.get('/vm_cloud/resize_form_fields/' + vm.id)
      .then(getResizeFormData)
      .catch(miqService.handleFailure);
  };

  $scope.cancelClicked = function() {
	miqService.sparkleOn();
    var url = '/vm_cloud/resize_vm/' + vm.id + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  $scope.submitClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/resize_vm/' + vm.id + '?button=submit';
    miqService.miqAjaxButton(url, vm.vmCloudModel);
  };

  function getResizeFormData(response) {
    var data = response.data;
    Object.assign(vm, data);
    miqService.sparkleOff();
  };

  vm.$onInit = init;
}
