ManageIQ.angular.app.controller('vmCloudDisassociateFloatingIpFormController', ['$http', '$scope', 'vmCloudDisassociateFloatingIpFormId', 'miqService', function($http, $scope, vmCloudDisassociateFloatingIpFormId, miqService) {
  var vm = this;

  vm.vmCloudModel = {
    floating_ip: null,
  };
  vm.floating_ips = [];
  vm.formId = vmCloudDisassociateFloatingIpFormId;
  vm.modelCopy = angular.copy(vm.vmCloudModel);

  ManageIQ.angular.scope = $scope;

  $http.get('/vm_cloud/disassociate_floating_ip_form_fields/' + vmCloudDisassociateFloatingIpFormId)
    .then(getDisassociateFloatingIpFormData)
    .catch(miqService.handleFailure);

  $scope.cancelClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/disassociate_floating_ip_vm/' + vmCloudDisassociateFloatingIpFormId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  $scope.submitClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/disassociate_floating_ip_vm/' + vmCloudDisassociateFloatingIpFormId + '?button=submit';
    miqService.miqAjaxButton(url, vm.vmCloudModel);
  };

  function getDisassociateFloatingIpFormData(response) {
    var data = response.data;
    Object.assign(vm, data);
    vm.modelCopy = angular.copy(vm.vmCloudModel);
    miqService.sparkleOff();
  }
}]);
