ManageIQ.angular.app.component('vmCloudResizeForm', {
    controller: vmCloudResizeFormController,
    controllerAs: 'vm',
    templateUrl: /static/_resize.html.haml
    bindings: {
        'repositoryId': '@',
    },
});

vmCloudResizeForm.$inject = ['miqService', 'API'];

function vmCloudResieForm(miqService, API){
    var vm = this;

    var init = function() {
    vm.vmCloudModel = {
      flavor_id: null,
    };
    vm.flavors = [];
    vm.formId = vm.vmCloudResizeFormId;
    vm.modelCopy = angular.copy(vm.vmCloudModel);

    ManageIQ.angular.scope = vm;

    $http.get('/vm_cloud/resize_form_fields/' + vm.vmCloudResizeFormId)
      .then(getResizeFormData)
      .catch(miqService.handleFailure);
  };

  $scope.cancelClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/resize_vm/' + vm.vmCloudResizeFormId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  $scope.submitClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/resize_vm/' + vm.vmCloudResizeFormId + '?button=submit';
    miqService.miqAjaxButton(url, vm.vmCloudModel);
  };

  function getResizeFormData(response) {
    var data = response.data;
    Object.assign(vm, data);
    miqService.sparkleOff();
  };

  vm.$onInit = init;

}
