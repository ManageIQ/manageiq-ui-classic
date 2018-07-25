ManageIQ.angular.app.controller('cloudVolumeBackupFormController', ['miqService', 'cloudVolumeBackupFormId', '$http', function(miqService, cloudVolumeBackupFormId, $http) {
  var vm = this;

  var init = function() {
    vm.afterGet = false;

    vm.cloudVolumeBackupModel = {
      volume_id: '',
    };

    vm.formId = cloudVolumeBackupFormId;
    vm.model = "cloudVolumeBackupModel";

    ManageIQ.angular.scope = vm;
    vm.saveable = function(form) {
      return form.$valid;
    };

    vm.newRecord = false;

    $http.get('/cloud_volume_backup/volume_form_choices')
      .then(getVolumeFormDataComplete)
      .catch(miqService.handleFailure);
  };

  vm.saveClicked = function() {
    var restoreUrl = '/cloud_volume_backup/backup_restore/';
    var buttonUrl = '?button=restore';
    miqService.miqAjaxButton(restoreUrl + cloudVolumeBackupFormId + buttonUrl, vm.cloudVolumeBackupModel, { complete: false });
  };

  vm.cancelClicked = function() {
    var cancelUrl = '/cloud_volume_backup/backup_restore/';
    var buttonUrl = '?button=cancel';
    miqService.miqAjaxButton(cancelUrl + cloudVolumeBackupFormId + buttonUrl);
  };

  vm.resetClicked = function(angularForm) {
    resetModel();
    angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  function getVolumeFormDataComplete(response) {
    vm.volume_choices = response.data.volume_choices;
    if (foundVolumes()) {
      vm.cloudVolumeBackupModel.volume = vm.volume_choices[0];
    }
  }

  function resetModel() {
    vm.cloudVolumeBackupModel = angular.copy(vm.modelCopy);
  }

  function foundVolumes() {
    return vm.volume_choices.length > 0;
  }

  init();
}]);
