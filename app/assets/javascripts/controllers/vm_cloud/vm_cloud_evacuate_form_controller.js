ManageIQ.angular.app.controller('vmCloudEvacuateFormController', ['$http', '$scope', 'vmCloudEvacuateFormId', 'miqService', function($http, $scope, vmCloudEvacuateFormId, miqService) {
  $scope.vmCloudModel = {
    auto_select_host:    true,
    destination_host:    null,
    on_shared_storage:   true,
    admin_password:      null
  };
  $scope.hosts = [];
  $scope.formId = vmCloudEvacuateFormId;
  $scope.modelCopy = angular.copy( $scope.vmCloudModel );

  ManageIQ.angular.scope = $scope;

  if (vmCloudEvacuateFormId) {
    $http.get('/vm_cloud/evacuate_form_fields/' + vmCloudEvacuateFormId)
      .then(getEvacuateFormData)
      .catch(miqService.handleFailure);
  }

  $scope.cancelClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/evacuate_vm?button=cancel';
    if (vmCloudEvacuateFormId) {
      url = '/vm_cloud/evacuate_vm/' + vmCloudEvacuateFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  $scope.submitClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/evacuate_vm?button=submit';
    if (vmCloudEvacuateFormId) {
      url = '/vm_cloud/evacuate_vm/' + vmCloudEvacuateFormId + '?button=submit';
    }
    miqService.miqAjaxButton(url, true);
  };

  function getEvacuateFormData(response) {
    var data = response.data;

    $scope.hosts = data.hosts;
    $scope.modelCopy = angular.copy( $scope.vmCloudModel );
    miqService.sparkleOff();
  }
}]);
