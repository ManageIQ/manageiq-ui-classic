ManageIQ.angular.app.controller('vmCloudDisassociateFloatingIpFormController', ['$http', '$scope', 'vmCloudDisassociateFloatingIpFormId', 'miqService', function($http, $scope, vmCloudDisassociateFloatingIpFormId, miqService) {
  var vm = this;

  vm.vmCloudModel = {
    floating_ip: null,
  };
  vm.floating_ips = [];
  vm.formId = vmCloudDisassociateFloatingIpFormId;
  vm.modelCopy = angular.copy( vm.vmCloudModel );

  ManageIQ.angular.scope = $scope;

  $http.get('/vm_cloud/disassociate_floating_ip_form_fields/' + vmCloudDisassociateFloatingIpFormId)
    .then(getDisassociateFloatingIpFormData)
    .catch(miqService.handleFailure);

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/disassociate_floating_ip_vm/' + vmCloudDisassociateFloatingIpFormId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  vm.submitClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/disassociate_floating_ip_vm/' + vmCloudDisassociateFloatingIpFormId + '?button=submit';
    miqService.miqAjaxButton(url, true);
  };

  function getDisassociateFloatingIpFormData(response) {
    var data = response.data;

    vm.floating_ips = data.floating_ips;
    vm.modelCopy = angular.copy( vm.vmCloudModel );
    miqService.sparkleOff();
  }
}]);
