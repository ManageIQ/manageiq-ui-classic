ManageIQ.angular.app.component('cloudVolumeBackupFormComponent', {
  templateUrl: '/static/cloud_volume_backup/volume_select.html.haml',
  controller: cloudVolumeBackupFormController,
  controllerAs: 'vm',
  bindings: {
    'cloudVolumeBackupFormId': '@',
  },
});

cloudVolumeBackupFormController.$inject = ['miqService', '$http'];

function cloudVolumeBackupFormController(miqService, $http) {
  var vm = this;

  var init = function() {
    vm.afterGet = false;

    vm.cloudVolumeBackupModel = {
      volume_id: '',
    };

    vm.formId = vm.cloudVolumeBackupFormId;
    vm.model = "cloudVolumeBackupModel";

    ManageIQ.angular.scope = vm;
    vm.saveable = miqService.saveable;

    vm.newRecord = false;

    $http.get('/cloud_volume_backup/volume_form_choices')
      .then(getVolumeFormDataComplete)
      .catch(miqService.handleFailure);
  };

  vm.saveClicked = function() {
    var restoreUrl = '/cloud_volume_backup/backup_restore/';
    var buttonUrl = '?button=restore';
    miqService.miqAjaxButton(restoreUrl + vm.cloudVolumeBackupFormId + buttonUrl, vm.cloudVolumeBackupModel, { complete: false });
  };

  vm.cancelClicked = function() {
    var cancelUrl = '/cloud_volume_backup/backup_restore/';
    var buttonUrl = '?button=cancel';
    miqService.miqAjaxButton(cancelUrl + vm.cloudVolumeBackupFormId + buttonUrl);
  };

  vm.resetClicked = function(angularForm) {
    resetModel();
    angularForm.$setPristine(true);
    miqService.miqFlash("warn", "All changes have been reset");
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

  vm.$onInit = init;
}
