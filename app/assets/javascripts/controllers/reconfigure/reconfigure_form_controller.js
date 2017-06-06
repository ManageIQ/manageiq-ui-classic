ManageIQ.angular.app.controller('reconfigureFormController', ['$http', '$scope', 'reconfigureFormId', 'objectIds', 'miqService', function($http, $scope, reconfigureFormId, objectIds, miqService) {
  var vm = this;
  var init = function() {
    vm.reconfigureModel = {
      memory:                  '0',
      memory_type:             '',
      socket_count:            '1',
      cores_per_socket_count:  '1',
      total_cpus:              '1',
      vmdisks:                 [],
      hdType:                  'thin',
      hdMode:                  'persistent',
      hdSize:                  '',
      hdUnit:                  'MB',
      cb_dependent:            true,
      addEnabled:              false,
      cb_bootable:             false,
      vmAddDisks:              [],
      vmRemoveDisks:           []
    };
    vm.cb_disks = false;
    vm.hdpattern = "^[1-9][0-9]*$";
    vm.reconfigureFormId = reconfigureFormId;
    vm.afterGet = false;
    vm.objectIds = objectIds;
    vm.cb_memory = vm.cb_memoryCopy = false;
    vm.cb_cpu = vm.cb_cpuCopy = false;
    vm.mem_type_prev = vm.reconfigureModel.memory_type;
    vm.validateClicked = miqService.validateWithAjax;
    vm.modelCopy = angular.copy( vm.reconfigureModel );
    vm.model = 'reconfigureModel';

    ManageIQ.angular.scope = vm;

    if (reconfigureFormId == 'new')
      vm.newRecord = true;
    else
      vm.newRecord = false;

    miqService.sparkleOn();
    $http.get('reconfigure_form_fields/' + reconfigureFormId + ',' + vm.objectIds)
      .then(getReconfigureFormData)
      .catch(miqService.handleFailure);
  };

  vm.canValidateBasicInfo = function () {
    if (vm.isBasicInfoValid())
      return true;
    else
      return false;
  };

  vm.isBasicInfoValid = function() {
    if(( $scope.angularForm.memory && !$scope.angularForm.memory.$valid) ||
      ($scope.angularForm.socket_count && !$scope.angularForm.socket_count.$valid) ||
      ($scope.angularForm.mem_type && !$scope.angularForm.mem_type.$valid) ||
      ($scope.angularForm.cores_per_socket_count && !$scope.angularForm.cores_per_socket_count.$valid) ||
      ($scope.angularForm.total_cpus && !$scope.angularForm.total_cpus.$valid)
      ($scope.angularForm.hdSize && !$scope.angularForm.hdSize.$valid))
      return false;
    else
      return true;
  };

  vm.cbChange = function() {
    var memUnchanged = false;
    var cpuUnchanged = false;
    miqService.miqFlashClear();

    if (!vm.newRecord)
      return;
    $scope.angularForm.$setValidity("unchanged", true);

    if (vm.cb_memory) {
      var memorynow = vm.reconfigureModel.memory;
      var memoryprev = vm.modelCopy.memory;
      if (vm.reconfigureModel.memory_type == 'GB')
        memorynow *= 1024;
      if(vm.modelCopy.memory_type == 'GB')
        memoryprev *= 1024;
      if (memorynow == memoryprev)
        memUnchanged = true;
    }

    if (vm.cb_cpu && ((vm.reconfigureModel.socket_count == vm.modelCopy.socket_count)) &&
      (vm.reconfigureModel.cores_per_socket_count == vm.modelCopy.cores_per_socket_count))
      cpuUnchanged = true;

    if (vm.cb_memory && vm.cb_cpu && memUnchanged && cpuUnchanged) {
      miqService.miqFlash("warn", __("Change Memory and Processor value to submit reconfigure request"));
      $scope.angularForm.$setValidity("unchanged", false);
    } else {
      if (vm.cb_memory && memUnchanged) {
        miqService.miqFlash("warn", __("Change Memory value to submit reconfigure request"));
        $scope.angularForm.$setValidity("unchanged", false);
      }
      if (vm.cb_cpu && cpuUnchanged) {
        miqService.miqFlash("warn", __("Change Processor Sockets or Cores Per Socket value to submit reconfigure request"));
        $scope.angularForm.$setValidity("unchanged", false);
      }
    }
  };

  vm.processorValueChanged = function() {
    if (vm.reconfigureModel.socket_count != '' && vm.reconfigureModel.cores_per_socket_count != '') {
      var vtotal_cpus = parseInt(vm.reconfigureModel.socket_count, 10) * parseInt(vm.reconfigureModel.cores_per_socket_count, 10);
      vm.reconfigureModel.total_cpus = vtotal_cpus.toString();
    }
    vm.cbChange();
  };

  vm.memtypeChanged = function() {
    if (vm.reconfigureModel.memory_type == "GB" && vm.mem_type_prev == "MB")
      vm.reconfigureModel.memory = ~~(parseInt(vm.reconfigureModel.memory, 10) / 1024);
    else if (vm.reconfigureModel.memory_type == "MB" && vm.mem_type_prev == "GB")
      vm.reconfigureModel.memory =  parseInt(vm.reconfigureModel.memory, 10) * 1024;
    vm.mem_type_prev = vm.reconfigureModel.memory_type;
    $scope.angularForm['memory'].$validate();
    vm.cbChange();
  };


  vm.updateDisksAddRemove = function() {
    vm.reconfigureModel.vmAddDisks.length = 0;
    vm.reconfigureModel.vmRemoveDisks.length = 0;
    for (var disk in vm.reconfigureModel.vmdisks) {
      if (vm.reconfigureModel.vmdisks[disk]['add_remove'] === 'remove') {
        vm.reconfigureModel.vmRemoveDisks.push({disk_name: vm.reconfigureModel.vmdisks[disk].hdFilename,
                                   delete_backing: vm.reconfigureModel.vmdisks[disk].delete_backing});
      } else if (vm.reconfigureModel.vmdisks[disk]['add_remove'] === 'add') {
        var dsize = parseInt(vm.reconfigureModel.vmdisks[disk].hdSize, 10);
        if (vm.reconfigureModel.vmdisks[disk].hdUnit == 'GB')
          dsize *= 1024;
        var dmode = (vm.reconfigureModel.vmdisks[disk].hdMode == 'persistent');
        var dtype = (vm.reconfigureModel.vmdisks[disk].hdType == 'thin');
        vm.reconfigureModel.vmAddDisks.push({disk_size_in_mb: dsize,
                                                 persistent: dmode,
                                                 thin_provisioned: dtype,
                                                 dependent: vm.reconfigureModel.vmdisks[disk].cb_dependent,
                                                 bootable: vm.reconfigureModel.vmdisks[disk].cb_bootable});
      }
    }
  };

  vm.resetAddValues = function() {
    vm.reconfigureModel.hdType = 'thin';
    vm.reconfigureModel.hdMode = 'persistent';
    vm.reconfigureModel.hdSize = '';
    vm.reconfigureModel.hdUnit = 'MB';
    vm.reconfigureModel.cb_dependent = true;
    vm.reconfigureModel.addEnabled = false;
    vm.reconfigureModel.cb_bootable = false;
  };

  vm.addDisk = function() {
    vm.reconfigureModel.vmdisks.push({hdFilename:'',
                                          hdType: vm.reconfigureModel.hdType,
                                          hdMode: vm.reconfigureModel.hdMode,
                                          hdSize: vm.reconfigureModel.hdSize,
                                          hdUnit: vm.reconfigureModel.hdUnit,
                                          cb_dependent: vm.reconfigureModel.cb_dependent,
                                          cb_bootable: vm.reconfigureModel.cb_bootable,
                                          add_remove: 'add'});
    vm.resetAddValues();

    vm.updateDisksAddRemove();

    if( vm.reconfigureModel.vmAddDisks.length > 0  || vm.reconfigureModel.vmRemoveDisks.length > 0)
      vm.cb_disks = true;
    else
      vm.cb_disks = false;
  };

  vm.enableDiskAdd = function() {
    vm.reconfigureModel.addEnabled = true;
  };

  vm.hideAddDisk = function() {
    vm.reconfigureModel.addEnabled = false;
    vm.resetAddValues();
  };

  vm.deleteDisk = function(name) {
    for (var disk in vm.reconfigureModel.vmdisks) {
      if (vm.reconfigureModel.vmdisks[disk].hdFilename === name)
        vm.reconfigureModel.vmdisks[disk]['add_remove'] = 'remove';
    }
    vm.updateDisksAddRemove();

    if( vm.reconfigureModel.vmAddDisks.length > 0  || vm.reconfigureModel.vmRemoveDisks.length > 0)
      vm.cb_disks = true;
    else
      vm.cb_disks = false;
  };

  vm.cancelAddRemoveDisk = function(vmDisk) {
    for (var disk in vm.reconfigureModel.vmdisks) {
      if (vm.reconfigureModel.vmdisks[disk].hdFilename === vmDisk['hdFilename']) {
        if (vm.reconfigureModel.vmdisks[disk]['add_remove'] === 'remove') {
          vm.reconfigureModel.vmdisks[disk]['add_remove'] = '';
          vm.reconfigureModel.vmdisks[disk]['cb_deletebacking'] = false;
          vm.reconfigureModel.vmdisks[disk]['cb_bootable'] = false;
        } else if (vm.reconfigureModel.vmdisks[disk]['add_remove'] === 'add') {
          var index = vm.reconfigureModel.vmdisks.indexOf(vmDisk);
          vm.reconfigureModel.vmdisks.splice(index, 1);
          break;
        }
      }
    }
    vm.updateDisksAddRemove();

    if (!angular.equals(vm.reconfigureModel.vmAddDisks, vm.modelCopy.vmAddDisks) || !angular.equals(vm.reconfigureModel.vmRemoveDisks, vm.modelCopy.vmRemoveDisks))
      vm.cb_disks = true;
    else
      vm.cb_disks = false;
  };

  var reconfigureEditButtonClicked = function(buttonName, serializeFields) {
    miqService.sparkleOn();
    var url = 'reconfigure_update/' + reconfigureFormId + '?button=' + buttonName;
    if (serializeFields === undefined) {
      miqService.miqAjaxButton(url);
    } else {
      miqService.miqAjaxButton(url, {objectIds: vm.objectIds,
                                     cb_memory: vm.cb_memory,
                                     cb_cpu: vm.cb_cpu,
                                     memory: vm.reconfigureModel.memory,
                                     memory_type: vm.reconfigureModel.memory_type,
                                     socket_count: vm.reconfigureModel.socket_count,
                                     cores_per_socket_count: vm.reconfigureModel.cores_per_socket_count,
                                     vmAddDisks: vm.reconfigureModel.vmAddDisks,
                                     vmRemoveDisks: vm.reconfigureModel.vmRemoveDisks
                                    });
    }
  };

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    miqService.miqAjaxButton('reconfigure_update?button=cancel');
  };

  vm.resetClicked = function() {
    $scope.$broadcast ('resetClicked');
    vm.reconfigureModel = angular.copy(vm.modelCopy);
    vm.cb_memory = vm.cb_memoryCopy;
    vm.cb_cpu = vm.cb_cpuCopy;
    vm.mem_type_prev = vm.reconfigureModel.memory_type;
    $scope.angularForm.$setPristine(true);
    vm.updateDisksAddRemove();
    if (!angular.equals(vm.reconfigureModel.vmAddDisks, vm.modelCopy.vmAddDisks) || !angular.equals(vm.reconfigureModel.vmRemoveDisks, vm.modelCopy.vmRemoveDisks))
      vm.cb_disks = true;
    else
      vm.cb_disks = false;
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  vm.submitClicked = function() {
    // change memory value based ontype
    reconfigureEditButtonClicked('submit', true);
    $scope.angularForm.$setPristine(true);
  };

  vm.addClicked = function() {
    vm.submitClicked();
  };

  function getReconfigureFormData(response) {
    var data = response.data;

    vm.reconfigureModel.memory                 = data.memory;
    vm.reconfigureModel.memory_type            = data.memory_type;
    vm.reconfigureModel.socket_count           = data.socket_count;
    vm.reconfigureModel.cores_per_socket_count = data.cores_per_socket_count;
    vm.mem_type_prev = vm.reconfigureModel.memory_type;
    vm.cb_memory = data.cb_memory;
    vm.cb_cpu = data.cb_cpu;
    vm.reconfigureModel.vmdisks = angular.copy(data.disks);

    vm.updateDisksAddRemove();

    angular.forEach(vm.reconfigureModel.vmdisks, function(disk) {
      if (disk !== undefined
        && ( disk.add_remove !== 'add' && disk.add_remove !== 'remove' )) {
        disk.delete_backing = false;
      }
    });
    if (data.socket_count && data.cores_per_socket_count) {
      vm.reconfigureModel.total_cpus = (parseInt(vm.reconfigureModel.socket_count, 10) * parseInt(vm.reconfigureModel.cores_per_socket_count, 10)).toString();
    }
    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.reconfigureModel );
    vm.cb_memoryCopy = vm.cb_memory;
    vm.cb_cpuCopy = vm.cb_cpu;

    miqService.sparkleOff();
  }

  init();
}]);
