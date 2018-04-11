ManageIQ.angular.app.controller('cloudVolumeFormController', ['miqService', 'API', 'cloudVolumeFormId', 'storageManagerId', '$timeout', function(miqService, API, cloudVolumeFormId, storageManagerId, $timeout) {
  var vm = this;

  var init = function() {
    vm.afterGet = false;

    vm.cloudVolumeModel = {
      name: '',
      aws_encryption: false,
      incremental: false,
      force: false,
      storage_manager_id: storageManagerId,
    };

    vm.formId = cloudVolumeFormId;
    vm.model = 'cloudVolumeModel';

    ManageIQ.angular.scope = vm;
    vm.saveable = miqService.saveable;

    vm.newRecord = cloudVolumeFormId === 'new';

    miqService.sparkleOn();
    API.get('/api/providers?expand=resources&attributes=id,name,supports_block_storage&filter[]=supports_block_storage=true')
      .then(getStorageManagers)
      .catch(miqService.handleFailure);

    if (cloudVolumeFormId !== 'new') {
      // Fetch cloud volume data before showing the form.
      API.get('/api/cloud_volumes/' + cloudVolumeFormId + '?attributes=ext_management_system.type,availability_zone.ems_ref,base_snapshot.ems_ref')
        .then(getCloudVolumeFormData)
        .catch(miqService.handleFailure);
    } else {
      // Initialise the form immediately when creating a new volume.
      setForm();
    }
  };

  vm.addClicked = function() {
    var url = 'create/new' + '?button=add';
    miqService.miqAjaxButton(url, vm.cloudVolumeModel, { complete: false });
  };

  vm.cancelClicked = function() {
    var url;
    if (cloudVolumeFormId === 'new') {
      url = '/cloud_volume/create/new' + '?button=cancel';
    } else {
      url = '/cloud_volume/update/' + cloudVolumeFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  vm.saveClicked = function() {
    var url = '/cloud_volume/update/' + cloudVolumeFormId + '?button=save';
    miqService.miqAjaxButton(url, vm.cloudVolumeModel, { complete: false });
  };

  vm.attachClicked = function() {
    var url = '/cloud_volume/attach_volume/' + cloudVolumeFormId + '?button=attach';
    miqService.miqAjaxButton(url, vm.cloudVolumeModel, { complete: false });
  };

  vm.detachClicked = function() {
    var url = '/cloud_volume/detach_volume/' + cloudVolumeFormId + '?button=detach';
    miqService.miqAjaxButton(url, vm.cloudVolumeModel, { complete: false });
  };

  vm.cancelAttachClicked = function() {
    miqService.sparkleOn();
    var url = '/cloud_volume/attach_volume/' + cloudVolumeFormId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  vm.cancelDetachClicked = function() {
    var url = '/cloud_volume/detach_volume/' + cloudVolumeFormId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  vm.backupCreateClicked = function() {
    var url = '/cloud_volume/backup_create/' + cloudVolumeFormId + '?button=create';
    miqService.miqAjaxButton(url, vm.cloudVolumeModel, { complete: false });
  };

  vm.cancelBackupCreateClicked = function() {
    var url = '/cloud_volume/backup_create/' + cloudVolumeFormId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  vm.backupRestoreClicked = function() {
    var url = '/cloud_volume/backup_restore/' + cloudVolumeFormId + '?button=restore';
    miqService.miqAjaxButton(url, vm.cloudVolumeModel, { complete: false });
  };

  vm.cancelBackupRestoreClicked = function() {
    var url = '/cloud_volume/backup_restore/' + cloudVolumeFormId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  vm.snapshotCreateClicked = function() {
    var url = '/cloud_volume/snapshot_create/' + cloudVolumeFormId + '?button=create';
    miqService.miqAjaxButton(url, vm.cloudVolumeModel, { complete: false });
  };

  vm.cancelSnapshotCreateClicked = function() {
    var url = '/cloud_volume/snapshot_create/' + cloudVolumeFormId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  vm.resetClicked = function(angularForm) {
    vm.cloudVolumeModel = angular.copy(vm.modelCopy);
    angularForm.$setPristine(true);
    miqService.miqFlash('warn', 'All changes have been reset');
  };

  vm.storageManagerChanged = function(id) {
    miqService.sparkleOn();
    API.get('/api/providers/' + id + '?attributes=type,parent_manager.availability_zones,parent_manager.cloud_tenants,parent_manager.cloud_volume_snapshots')
      .then(getStorageManagerFormData)
      .catch(miqService.handleFailure);
  };

  vm.sizeChanged = function(size) {
    // Dynamically update the AWS IOPS only if GP2 volume type is selected.
    if (vm.cloudVolumeModel.aws_volume_type === 'gp2') {
      var volumeSize = parseInt(size, 10);

      if (isNaN(volumeSize)) {
        vm.cloudVolumeModel.aws_iops = null;
      } else {
        vm.cloudVolumeModel.aws_iops = Math.max(100, Math.min(volumeSize * 3, 10000));
      }
    }
  };

  vm.awsVolumeTypeChanged = function(voltype) {
    // The requested number of I/O operations per second that the volume can
    // support. For Provisioned IOPS (SSD) volumes, you can provision up to 50
    // IOPS per GiB. For General Purpose (SSD) volumes, baseline performance is
    // 3 IOPS per GiB, with a minimum of 100 IOPS and a maximum of 10000 IOPS.
    // General Purpose (SSD) volumes under 1000 GiB can burst up to 3000 IOPS

    switch (voltype) {
      case 'gp2':
      case 'io1':
        var volumeSize = parseInt(vm.cloudVolumeModel.size, 10);
        if (isNaN(volumeSize)) {
          vm.cloudVolumeModel.aws_iops = '';
        } else if (voltype === 'gp2') {
          vm.cloudVolumeModel.aws_iops = Math.max(100, Math.min(volumeSize * 3, 10000));
        } else {
          // Default ratio is 50 IOPS per 1 GiB. 20000 IOPS is the max.
          vm.cloudVolumeModel.aws_iops = Math.min(volumeSize * 50, 20000);
        }
        break;

      default:
        vm.cloudVolumeModel.aws_iops = 'Not Applicable';
        break;
    }
  };

  vm.canModifyVolumeSize = function() {
    // Volume size can be modified when adding a new cloud volume or when
    // editin Amazon EBS volume whose type is not magnetic (all other volume types
    // can be resized on the fly).
    return vm.newRecord ||
      (vm.cloudVolumeModel.emstype === 'ManageIQ::Providers::Amazon::StorageManager::Ebs' &&
        vm.cloudVolumeModel.aws_volume_type !== 'standard');
  };

  vm.awsBaseSnapshotChanged = function(baseSnapshotId) {
    vm.encryptionDisabled = false;
    $timeout(function() {
      if (baseSnapshotId) {
        for (var i = 0; i < vm.baseSnapshotChoices.length; i++) {
          if (vm.baseSnapshotChoices[i].ems_ref === baseSnapshotId) {
            vm.cloudVolumeModel.aws_encryption = vm.baseSnapshotChoices[i].encrypted === true;
            vm.encryptionDisabled = true;
          }
        }
      } else {
        vm.cloudVolumeModel.aws_encryption = false;
      }
    }, 0);
  };

  function setForm() {
    loadEBSVolumeTypes();

    vm.modelCopy = angular.copy(vm.cloudVolumeModel);
    vm.afterGet = true;
    miqService.sparkleOff();
  }

  var loadEBSVolumeTypes = function() {
    // This ia a fixed list of available cloud volume types for Amazon EBS.
    vm.awsVolumeTypes = [
      { type: 'gp2', name: 'General Purpose SSD (GP2)' },
      { type: 'io1', name: 'Provisioned IOPS SSD (IO1)' },
      { type: 'st1', name: 'Throughput Optimized HDD (ST1)' },
      { type: 'sc1', name: 'Cold HDD (SC1)' },
    ];

    // Standard volume type is available only when creating new volume or editing
    // an existing standard volume. In the latter case, it is only available so
    // that the "Magnetic (standard)" option can be picked in the select that is
    // otherwise disabled.
    if (vm.newRecord || vm.cloudVolumeModel.aws_volume_type === 'standard') {
      vm.awsVolumeTypes.push({ type: 'standard', name: 'Magnetic' });
    }
  };

  var getStorageManagers = function(data) {
    vm.storageManagers = data.resources;

    // If storage manager ID was provided, we need to refresh the form and show
    // corresponding form fields.
    if (storageManagerId) {
      vm.storageManagerChanged(vm.cloudVolumeModel.storage_manager_id);
    }
  };

  var getCloudVolumeFormData = function(data) {
    vm.cloudVolumeModel.emstype = data.ext_management_system.type;
    vm.cloudVolumeModel.name = data.name;
    // We have to display size in GB.
    vm.cloudVolumeModel.size = data.size / 1073741824;
    vm.cloudVolumeModel.cloud_tenant_id = data.cloud_tenant_id;
    // Currently, this is only relevant for AWS volumes so we are prefixing the
    // model attribute with AWS.
    vm.cloudVolumeModel.aws_volume_type = data.volume_type;
    vm.cloudVolumeModel.aws_availability_zone_id = data.availability_zone.ems_ref;
    vm.cloudVolumeModel.aws_encryption = data.encrypted;
    vm.cloudVolumeModel.aws_iops = data.iops;

    // If volume was created from snapshot and this snapshot still exists
    if (data.base_snapshot) {
      vm.cloudVolumeModel.aws_base_snapshot_id = data.base_snapshot.ems_ref;
    }

    // Update the IOPS based on the current volume size.
    if (angular.isUndefined(vm.cloudVolumeModel.aws_iops)) {
      vm.sizeChanged(vm.cloudVolumeModel.size);
    }

    setForm();
  };

  var getStorageManagerFormData = function(data) {
    vm.cloudVolumeModel.emstype = data.type;
    vm.cloudTenantChoices = data.parent_manager.cloud_tenants;
    vm.availabilityZoneChoices = data.parent_manager.availability_zones;
    vm.baseSnapshotChoices = data.parent_manager.cloud_volume_snapshots;

    miqService.sparkleOff();
  };

  init();
}]);
