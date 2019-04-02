ManageIQ.angular.app.component('cloudVolumeBackupForm', {
  templateUrl: '/static/cloud_volume_backup/volume_select.html.haml',
  controller: cloudVolumeBackupFormController,
  controllerAs: 'vm',
  bindings: {
    'recordId': '@',
  },
});

cloudVolumeBackupFormController.$inject = ['miqService', '$http'];

function cloudVolumeBackupFormController(miqService, $http) {
  var vm = this;

  var init = function() {
    vm.afterGet = false;

    vm.cloudVolumeBackupModel = {
      volume: '',
    };

    vm.model = 'cloudVolumeBackupModel';

    ManageIQ.angular.scope = vm;
    vm.saveable = function(form) {
      return form.$valid;
    };

    vm.newRecord = false;

    miqService.sparkleOn();
    $http.get('/cloud_volume_backup/volume_form_choices')
      .then(getVolumeFormDataComplete)
      .catch(miqService.handleFailure);
  };

  vm.saveClicked = function() {
    miqService.sparkleOn();
    var restoreUrl = '/cloud_volume_backup/backup_restore/';
    var buttonUrl = '?button=restore';
    miqService.miqAjaxButton(restoreUrl + vm.recordId + buttonUrl, vm.cloudVolumeBackupModel, { complete: false });
  };

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    var cancelUrl = '/cloud_volume_backup/backup_restore/';
    var buttonUrl = '?button=cancel';
    miqService.miqAjaxButton(cancelUrl + vm.recordId + buttonUrl);
  };

  vm.resetClicked = function(angularForm) {
    resetModel();
    angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  function getVolumeFormDataComplete(response) {
    vm.volume_choices = response.data.volume_choices;
    if (foundVolumes()) {
      vm.cloudVolumeBackupModel.volume = vm.volume_choices[0];
    }
    vm.modelCopy = angular.copy(vm.cloudVolumeBackupModel);
    miqService.sparkleOff();
  }

  function resetModel() {
    vm.cloudVolumeBackupModel = angular.copy(vm.modelCopy);
  }

  function foundVolumes() {
    return vm.volume_choices.length > 0;
  }

  vm.$onInit = init;
}
