ManageIQ.angular.app.controller('vmCloudLiveMigrateFormController', ['$http', '$scope', 'vmCloudLiveMigrateFormId', 'miqService', function($http, $scope, vmCloudLiveMigrateFormId, miqService) {
  $scope.vmCloudModel = {
    auto_select_host:    true,
    cluster_id:          null,
    destination_host_id: null,
    block_migration:     false,
    disk_over_commit:    false
  };
  $scope.clusters = [];
  $scope.hosts = [];
  $scope.filtered_hosts = [];
  $scope.formId = vmCloudLiveMigrateFormId;
  $scope.modelCopy = angular.copy( $scope.vmCloudModel );

  ManageIQ.angular.scope = $scope;

  if (vmCloudLiveMigrateFormId) {
    $http.get('/vm_cloud/live_migrate_form_fields/' + vmCloudLiveMigrateFormId)
      .then(getLiveMigrateFormData)
      .catch(miqService.handleFailure);
  }

  $scope.cancelClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/live_migrate_vm/?button=cancel';
    if (vmCloudLiveMigrateFormId) {
      url = '/vm_cloud/live_migrate_vm/' + vmCloudLiveMigrateFormId + '?button=cancel';
    }

    miqService.miqAjaxButton(url);
  };

  $scope.submitClicked = function() {
    miqService.sparkleOn();
    var url = '/vm_cloud/live_migrate_vm?button=submit';
    if (vmCloudLiveMigrateFormId) {
      url = '/vm_cloud/live_migrate_vm/' + vmCloudLiveMigrateFormId + '?button=submit';
    }
    miqService.miqAjaxButton(url, true);
  };

  function getLiveMigrateFormData(response) {
    var data = response.data;

    $scope.clusters = data.clusters;
    $scope.hosts = data.hosts;
    $scope.modelCopy = angular.copy( $scope.vmCloudModel );
    miqService.sparkleOff();
  }
}]);
