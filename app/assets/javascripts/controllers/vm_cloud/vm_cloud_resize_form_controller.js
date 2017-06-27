ManageIQ.angular.app.controller('vmCloudResizeFormController', ['$http', '$scope', 'vmCloudResizeFormId', 'miqService', function($http, $scope, vmCloudResizeFormId, miqService) {
  var vm = this;

  var init = function() {
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
}]);
