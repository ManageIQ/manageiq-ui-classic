ManageIQ.angular.app.component('cloudVolumeAttachForm', {
  bindings: {
    cloudVolumeFormId: '@',
    storageManagerId: '@'
  },
  controllerAs: 'vm',
  controller: ['miqService', 'API', 'vmChoices', 'extManagementSystem', function(miqService, API, vmChoices, extManagementSystem) {
    var vm = this;

    this.$onInit = function() {
      vm.afterGet = false;
      vm.vmChoices = vmChoices;
      vm.extManagementSystem = extManagementSystem;

      vm.cloudVolumeModel = {
        name: '',
        aws_encryption: false,
        incremental: false,
        force: false,
        storage_manager_id: vm.storageManagerId,
      };

      vm.formId = this.cloudVolumeFormId;
      vm.model = 'cloudVolumeModel';

      ManageIQ.angular.scope = vm;
      vm.saveable = miqService.saveable;

      // Fetch cloud volume data before showing the form.
      API.get('/api/cloud_volumes/' + this.cloudVolumeFormId + '?attributes=ext_management_system.type,availability_zone.ems_ref,base_snapshot.ems_ref')
        .then(getCloudVolumeFormData)
        .catch(miqService.handleFailure);
    };

    vm.attachClicked = function() {
      var url = '/cloud_volume/attach_volume/' + this.cloudVolumeFormId + '?button=attach';
      miqService.miqAjaxButton(url, vm.cloudVolumeModel, { complete: false });
    };

    vm.cancelAttachClicked = function() {
      miqService.sparkleOn();
      var url = '/cloud_volume/attach_volume/' + this.cloudVolumeFormId + '?button=cancel';
      miqService.miqAjaxButton(url);
    };

    vm.resetClicked = function(angularForm) {
      vm.cloudVolumeModel = angular.copy(vm.modelCopy);
      angularForm.$setPristine(true);
      miqService.miqFlash('warn', 'All changes have been reset');
    };

    var getCloudVolumeFormData = function(data) {
      vm.cloudVolumeModel.emstype = data.ext_management_system.type;
      vm.cloudVolumeModel.name = data.name;

      vm.cloudVolumeModel.cloud_tenant_id = data.cloud_tenant_id;

      setForm();
    };

    function setForm() {
      vm.modelCopy = angular.copy(vm.cloudVolumeModel);
      vm.afterGet = true;
      miqService.sparkleOff();
    }
  }],
  templateUrl: '/static/cloud_volume/cloud_volume_attach_form.html.haml',
});
