ManageIQ.angular.app.controller('cloudVolumeFormController', ['$http', '$scope', 'cloudVolumeFormId', 'miqService', 'API', function($http, $scope, cloudVolumeFormId, miqService, API) {
  var init = function() {
    $scope.cloudVolumeModel = {
      aws_encryption: false,
    };
    $scope.formId = cloudVolumeFormId;
    $scope.afterGet = false;
    $scope.modelCopy = angular.copy( $scope.cloudVolumeModel );
    $scope.model = "cloudVolumeModel";

    // This ia a fixed list of available cloud volume types for AWS.
    $scope.awsVolumeTypes = [
      { type: "gp2", name: "General Purpose SSD (GP2)" },
      { type: "io1", name: "Provisioned IOPS SSD (IO1)" },
      { type: "st1", name: "Throughput Optimized HDD (ST1)" },
      { type: "sc1", name: "Cold HDD (SC1)" },
      { type: "magnetic", name: "Magnetic" },
    ];

    ManageIQ.angular.scope = $scope;

    if (cloudVolumeFormId == 'new') {
      $scope.cloudVolumeModel.name = "";
    } else {
      miqService.sparkleOn();
      $http.get('/cloud_volume/cloud_volume_form_fields/' + cloudVolumeFormId)
        .then(getCloudVolumeFormDataComplete)
        .catch(miqService.handleFailure);
    }
  };

  function getCloudVolumeFormDataComplete(response) {
    var data = response.data;

    $scope.afterGet = true;
    $scope.cloudVolumeModel.name = data.name;

    $scope.modelCopy = angular.copy( $scope.cloudVolumeModel );
    miqService.sparkleOff();
  }

  $scope.storageManagerChanged = function(id) {
    miqService.sparkleOn();
    API.get('/api/providers/' + id + '?attributes=type,parent_manager.availability_zones,parent_manager.cloud_tenants')
      .then(getStorageManagerFormDataComplete)
      .catch(miqService.handleFailure);
  };

  function getStorageManagerFormDataComplete(data) {
    $scope.afterGet = true;
    $scope.cloudVolumeModel.emstype = data.type;
    $scope.cloudTenantChoices = data.parent_manager.cloud_tenants;
    $scope.availabilityZoneChoices = data.parent_manager.availability_zones;

    miqService.sparkleOff();
  }

  $scope.addClicked = function() {
    var url = 'create/new' + '?button=add';
    miqService.miqAjaxButton(url, $scope.cloudVolumeModel, { complete: false });
  };

  $scope.cancelClicked = function() {
    if (cloudVolumeFormId == 'new') {
      var url = '/cloud_volume/create/new' + '?button=cancel';
    } else {
      var url = '/cloud_volume/update/' + cloudVolumeFormId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  $scope.saveClicked = function() {
    var url = '/cloud_volume/update/' + cloudVolumeFormId + '?button=save';
    miqService.miqAjaxButton(url, $scope.cloudVolumeModel, { complete: false });
  };

  $scope.attachClicked = function() {
    var url = '/cloud_volume/attach_volume/' + cloudVolumeFormId + '?button=attach';
    miqService.miqAjaxButton(url, $scope.cloudVolumeModel, { complete: false });
  };

  $scope.detachClicked = function() {
    var url = '/cloud_volume/detach_volume/' + cloudVolumeFormId + '?button=detach';
    miqService.miqAjaxButton(url, $scope.cloudVolumeModel, { complete: false });
  };

  $scope.cancelAttachClicked = function() {
    miqService.sparkleOn();
    var url = '/cloud_volume/attach_volume/' + cloudVolumeFormId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  $scope.cancelDetachClicked = function() {
    var url = '/cloud_volume/detach_volume/' + cloudVolumeFormId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  $scope.backupCreateClicked = function() {
    var url = '/cloud_volume/backup_create/' + cloudVolumeFormId + '?button=create';
    miqService.miqAjaxButton(url, $scope.cloudVolumeModel, { complete: false });
  };

  $scope.cancelBackupCreateClicked = function() {
    var url = '/cloud_volume/backup_create/' + cloudVolumeFormId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  $scope.backupRestoreClicked = function() {
    var url = '/cloud_volume/backup_restore/' + cloudVolumeFormId + '?button=restore';
    miqService.miqAjaxButton(url, $scope.cloudVolumeModel, { complete: false });
  };

  $scope.cancelBackupRestoreClicked = function() {
    var url = '/cloud_volume/backup_restore/' + cloudVolumeFormId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  $scope.snapshotCreateClicked = function() {
    var url = '/cloud_volume/snapshot_create/' + cloudVolumeFormId + '?button=create';
    miqService.miqAjaxButton(url, $scope.cloudVolumeModel, { complete: false });
  };

  $scope.cancelSnapshotCreateClicked = function() {
    var url = '/cloud_volume/snapshot_create/' + cloudVolumeFormId + '?button=cancel';
    miqService.miqAjaxButton(url);
  };

  $scope.resetClicked = function() {
    $scope.cloudVolumeModel = angular.copy( $scope.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", "All changes have been reset");
  };

  $scope.sizeChanged = function(size) {
    // Dynamically update the AWS IOPS only if GP2 volume type is selected.
    if ($scope.cloudVolumeModel.aws_volume_type === 'gp2') {
      var volumeSize = parseInt(size, 10);

      if (isNaN(volumeSize)) {
        $scope.cloudVolumeModel.aws_iops = null;
      } else {
        $scope.cloudVolumeModel.aws_iops = Math.max(100, Math.min(volumeSize * 3, 10000));
      }
    }
  };

  $scope.awsVolumeTypeChanged = function(voltype) {
    // The requested number of I/O operations per second that the volume can
    // support. For Provisioned IOPS (SSD) volumes, you can provision up to 50
    // IOPS per GiB. For General Purpose (SSD) volumes, baseline performance is
    // 3 IOPS per GiB, with a minimum of 100 IOPS and a maximum of 10000 IOPS.
    // General Purpose (SSD) volumes under 1000 GiB can burst up to 3000 IOPS

    switch (voltype) {
      case "gp2":
      case "io1":
        var volumeSize = parseInt($scope.cloudVolumeModel.size, 10);
        if (isNaN(volumeSize)) {
          $scope.cloudVolumeModel.aws_iops = '';
        } else if (voltype === 'gp2') {
          $scope.cloudVolumeModel.aws_iops = Math.max(100, Math.min(volumeSize * 3, 10000));
        } else {
          // Default ratio is 50 IOPS per 1 GiB. 20000 IOPS is the max.
          $scope.cloudVolumeModel.aws_iops = Math.min(volumeSize * 50, 20000);
        }
        break;

      default:
        $scope.cloudVolumeModel.aws_iops = 'Not Applicable';
        break;
    }
  };

  init();
}]);
