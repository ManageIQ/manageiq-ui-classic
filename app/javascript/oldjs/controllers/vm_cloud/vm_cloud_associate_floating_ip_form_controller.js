ManageIQ.angular.app.controller('vmCloudAssociateFloatingIpFormController', ['$http', '$scope', 'vmCloudAssociateFloatingIpFormId', 'miqService', function($http, $scope, vmCloudAssociateFloatingIpFormId, miqService) {
  var vm = this;
  vm.vmCloudModel = {
    floating_ip: null,
  };
  vm.floating_ips = [];
  vm.formId = vmCloudAssociateFloatingIpFormId;
  vm.modelCopy = angular.copy( vm.vmCloudModel );
  vm.newRecord = true;
  vm.saveable = miqService.saveable;

  ManageIQ.angular.scope = $scope;

  $http.get('/vm_cloud/associate_floating_ip_form_fields/' + vmCloudAssociateFloatingIpFormId)
    .then(getAssociateFloatingIpFormData)
    .catch(miqService.handleFailure);

  vm.cancelClicked = $scope.cancelClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/associate_floating_ip_vm/' + vmCloudAssociateFloatingIpFormId + '?button=cancel';
    miqService.miqAjaxButton(url, {complete: false});
  };

  vm.submitClicked = $scope.submitClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/associate_floating_ip_vm/' + vmCloudAssociateFloatingIpFormId + '?button=submit';
    miqService.miqAjaxButton(url, vm.vmCloudModel, {complete: false});
  };

  function getAssociateFloatingIpFormData(response) {
    var data = response.data;

    Object.assign(vm, data);
    vm.modelCopy = angular.copy( vm.vmCloudModel );
    miqService.sparkleOff();
  }
}]);
