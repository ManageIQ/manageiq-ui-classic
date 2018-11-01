ManageIQ.angular.app.controller('reconfigureFormController', ['$http', '$scope', 'reconfigureFormId', 'objectIds', 'miqService', function($http, $scope, reconfigureFormId, objectIds, miqService) {
  var vm = this;
  var init = function() {
    vm.reconfigureModel = {
      memory: '0',
      memory_type: '',
      socket_count: '1',
      cores_per_socket_count: '1',
      total_cpus: '1',
      vmdisks: [],
      hdType: 'thin',
      hdMode: 'persistent',
      hdSize: '',
      hdUnit: 'MB',
      new_controller_type: 'VirtualLsiLogicController',
      cb_dependent: true,
      nicsEnabled: false,
      addEnabled: false,
      cdRomConnectEnabled: false,
      enableAddDiskButton: true,
      enableAddNetworkAdapterButton: true,
      enableConnectCDRomButton: true,
      cb_bootable: false,
      vmAddDisks: [],
      vmRemoveDisks: [],
      vmResizeDisks: [],
      vLan_requested: '',
      adapterNetwork: '',
      availableAdapterNetworks: [],
      cdRom: '',
      vmCDRoms: [],
    };
    vm.cb_disks = false;
    vm.cb_networkAdapters = false;
    vm.cb_cdRoms = false;
    vm.hdpattern = '^[1-9][0-9]*$';
    vm.reconfigureFormId = reconfigureFormId;
    vm.afterGet = false;
    vm.objectIds = objectIds;
    vm.cb_memory = vm.cb_memoryCopy = false;
    vm.cb_cpu = vm.cb_cpuCopy = false;
    vm.mem_type_prev = vm.reconfigureModel.memory_type;
    vm.validateClicked = miqService.validateWithAjax;
    vm.modelCopy = angular.copy( vm.reconfigureModel );
    vm.model = 'reconfigureModel';
    vm.vm_vendor = '';
    vm.vm_type = '';
    vm.disk_default_type = '';
    vm.availableIsoFiles = [];
    vm.selected_iso = ['', null];

    ManageIQ.angular.scope = vm;

    if (reconfigureFormId === 'new') {
      vm.newRecord = true;
    } else {
      vm.newRecord = false;
    }

    miqService.sparkleOn();
    $http.get('reconfigure_form_fields/' + reconfigureFormId + ',' + vm.objectIds)
      .then(getReconfigureFormData)
      .catch(miqService.handleFailure);
  };

  vm.setEnableAddDiskButton = function() {
    var nrDisksAfterReconfigure = 0;
    angular.forEach(vm.reconfigureModel.vmdisks, function(disk) {
      switch (disk.add_remove) {
        case 'remove':
          break;
        default:
          nrDisksAfterReconfigure++;
          break;
      }
    });
    vm.reconfigureModel.enableAddDiskButton = (nrDisksAfterReconfigure < 4);
  };

  vm.setEnableAddNetworkAdapterButton = function() {
    var nrNetworksAfterReconfigure = _.reject(vm.reconfigureModel.vmNetworkAdapters, { add_remove: 'remove' }).length;
    vm.reconfigureModel.enableAddNetworkAdapterButton = (nrNetworksAfterReconfigure < 4);
  };

  vm.canValidateBasicInfo = function() {
    if (vm.isBasicInfoValid()) {
      return true;
    }
    return false;
  };

  vm.isBasicInfoValid = function() {
    if (($scope.angularForm.memory && ! $scope.angularForm.memory.$valid) ||
      ($scope.angularForm.socket_count && ! $scope.angularForm.socket_count.$valid) ||
      ($scope.angularForm.mem_type && ! $scope.angularForm.mem_type.$valid) ||
      ($scope.angularForm.cores_per_socket_count && ! $scope.angularForm.cores_per_socket_count.$valid) ||
      ($scope.angularForm.total_cpus && ! $scope.angularForm.total_cpus.$valid) ||
      ($scope.angularForm.hdSize && ! $scope.angularForm.hdSize.$valid)) {
      return false;
    }
    return true;
  };

  vm.cbChange = function() {
    var memUnchanged = false;
    var cpuUnchanged = false;
    miqService.miqFlashClear();

    if (! vm.newRecord) {
      return;
    }
    $scope.angularForm.$setValidity('unchanged', true);

    if (vm.cb_memory) {
      var memorynow = vm.reconfigureModel.memory;
      var memoryprev = vm.modelCopy.memory;
      if (vm.reconfigureModel.memory_type === 'GB') {
        memorynow *= 1024;
      }
      if (vm.modelCopy.memory_type === 'GB') {
        memoryprev *= 1024;
      }
      if (memorynow === memoryprev) {
        memUnchanged = true;
      }
    }

    if (vm.cb_cpu && ((vm.reconfigureModel.socket_count === vm.modelCopy.socket_count)) &&
      (vm.reconfigureModel.cores_per_socket_count === vm.modelCopy.cores_per_socket_count)) {
      cpuUnchanged = true;
    }

    if (vm.cb_memory && vm.cb_cpu && memUnchanged && cpuUnchanged) {
      miqService.miqFlash('warn', __('Change Memory and Processor value to submit reconfigure request'));
      $scope.angularForm.$setValidity('unchanged', false);
    } else {
      if (vm.cb_memory && memUnchanged) {
        miqService.miqFlash('warn', __('Change Memory value to submit reconfigure request'));
        $scope.angularForm.$setValidity('unchanged', false);
      }
      if (vm.cb_cpu && cpuUnchanged) {
        miqService.miqFlash('warn', __('Change Processor Sockets or Cores Per Socket value to submit reconfigure request'));
        $scope.angularForm.$setValidity('unchanged', false);
      }
    }
  };

  vm.processorValueChanged = function() {
    if (vm.reconfigureModel.socket_count !== '' && vm.reconfigureModel.cores_per_socket_count !== '') {
      var vtotalCpus = parseInt(vm.reconfigureModel.socket_count, 10) * parseInt(vm.reconfigureModel.cores_per_socket_count, 10);
      vm.reconfigureModel.total_cpus = vtotalCpus.toString();
    }
    vm.cbChange();
  };

  vm.memtypeChanged = function() {
    if (vm.reconfigureModel.memory_type === 'GB' && vm.mem_type_prev === 'MB') {
      vm.reconfigureModel.memory = ~~(parseInt(vm.reconfigureModel.memory, 10) / 1024);
    } else if (vm.reconfigureModel.memory_type === 'MB' && vm.mem_type_prev === 'GB') {
      vm.reconfigureModel.memory =  parseInt(vm.reconfigureModel.memory, 10) * 1024;
    }
    vm.mem_type_prev = vm.reconfigureModel.memory_type;
    $scope.angularForm.memory.$validate();
    vm.cbChange();
  };

  vm.updateDisksAddRemove = function() {
    vm.reconfigureModel.vmAddDisks    = [];
    vm.reconfigureModel.vmRemoveDisks = [];
    vm.reconfigureModel.vmResizeDisks = [];
    angular.forEach(vm.reconfigureModel.vmdisks, function(disk) {
      if (disk.add_remove === 'remove') {
        vm.reconfigureModel.vmRemoveDisks.push({
          disk_name: disk.hdFilename,
          delete_backing: disk.delete_backing});
      } else if (disk.add_remove === 'resize') {
        var diskSizeResize = parseInt(disk.hdSize, 10);
        if (disk.hdUnit === 'GB') {
          diskSizeResize *= 1024;
        }
        vm.reconfigureModel.vmResizeDisks.push({
          disk_name: disk.hdFilename,
          disk_size_in_mb: diskSizeResize});
      } else if (disk.add_remove === 'add') {
        var diskSizeAdd = parseInt(disk.hdSize, 10);
        if (disk.hdUnit === 'GB') {
          diskSizeAdd *= 1024;
        }
        var dmode = (disk.hdMode === 'persistent');
        var dtype = (disk.hdType === 'thin');
        vm.reconfigureModel.vmAddDisks.push({disk_size_in_mb: diskSizeAdd,
          persistent: dmode,
          thin_provisioned: dtype,
          type: disk.hdType,
          new_controller_type: disk.new_controller_type,
          dependent: disk.cb_dependent,
          bootable: disk.cb_bootable});
      } else if (disk.add_remove === '') {
        disk.delete_backing = false;
      }
    });
    if (vm.reconfigureModel.vmAddDisks.length > 0 ||
        vm.reconfigureModel.vmRemoveDisks.length > 0 ||
        vm.reconfigureModel.vmResizeDisks.length > 0) {
      vm.cb_disks = true;
    } else {
      vm.cb_disks = false;
    }
    vm.setEnableAddDiskButton();
  };

  vm.updateNetworkAdaptersAddRemove = function() {
    vm.reconfigureModel.vmAddNetworkAdapters = [];
    vm.reconfigureModel.vmRemoveNetworkAdapters = [];
    angular.forEach(vm.reconfigureModel.vmNetworkAdapters, function(networkAdapter) {
      if (networkAdapter.add_remove === 'add') {
        vm.reconfigureModel.vmAddNetworkAdapters.push(
          {
            network: networkAdapter.vlan,
            name: networkAdapter.name,
            cloud_network: networkAdapter.network,
          }
        );
      }
      if (networkAdapter.add_remove === 'remove') {
        vm.reconfigureModel.vmRemoveNetworkAdapters.push({network: networkAdapter});
      }
    });
    vm.setEnableAddNetworkAdapterButton();
    vm.cb_networkAdapters = vm.reconfigureModel.vmAddNetworkAdapters.length > 0  ||
                            vm.reconfigureModel.vmRemoveNetworkAdapters.length > 0;
  };

  vm.resetAddValues = function() {
    vm.reconfigureModel.hdType = vm.disk_default_type;
    vm.reconfigureModel.hdMode = 'persistent';
    vm.reconfigureModel.hdSize = '';
    vm.reconfigureModel.hdUnit = 'MB';
    vm.reconfigureModel.new_controller_type = 'VirtualLsiLogicController';
    vm.reconfigureModel.cb_dependent = true;
    vm.reconfigureModel.addEnabled = false;
    vm.reconfigureModel.cb_bootable = false;
  };

  vm.validateAddSelectedNetwork = function() {
    if (! vm.reconfigureModel.vLan_requested && ! vm.isVmwareCloud()) {
      return false;
    } else if (! vm.reconfigureModel.name && vm.isVmwareCloud()) {
      return false;
    } else if (vm.reconfigureModel.vmNetworkAdapters.length > 4) {
      return false;
    }
    return true;
  };

  vm.processAddSelectedNetwork = function() {
    vm.reconfigureModel.vmNetworkAdapters.push(
      {
        name: vm.reconfigureModel.name ? vm.reconfigureModel.name : __('to be determined'),
        vlan: vm.reconfigureModel.vLan_requested,
        network: vm.reconfigureModel.adapterNetwork,
        mac: __('not available yet'),
        add_remove: 'add',
      });
    vm.resetAddNetworkAdapterValues();
    vm.updateNetworkAdaptersAddRemove();
  };

  vm.removeExistingNetworkAdapter = function(thisNetworkAdapter) {
    thisNetworkAdapter.add_remove = 'remove';
    vm.updateNetworkAdaptersAddRemove();
  };

  vm.enableAddNetworkAdapter = function() {
    vm.reconfigureModel.nicsEnabled = true;
    vm.reconfigureModel.enableAddNetworkAdapterButton = false;
    vm.reconfigureModel.showDropDownNetwork = true;
    vm.reconfigureModel.vLan_requested = '';
  };

  vm.hideAddNetworkAdapter = function() {
    vm.resetAddNetworkAdapterValues();
  };

  vm.resetAddNetworkAdapterValues = function() {
    vm.reconfigureModel.nicsEnabled = false;
    vm.reconfigureModel.addNetworkAdapterEnabled = false;
    vm.reconfigureModel.showDropDownNetwork = false;
    vm.setEnableAddNetworkAdapterButton();
    vm.reconfigureModel.vLan_requested = '';
    vm.reconfigureModel.name = '';
    vm.reconfigureModel.adapterNetwork = '';
  };

  vm.cancelAddRemoveNetworkAdapter = function(vmNetworkAdapter) {
    if (vmNetworkAdapter.add_remove === 'remove') {
      vmNetworkAdapter.add_remove = '';
    } else if (vmNetworkAdapter.add_remove === 'add') {
      var index = vm.reconfigureModel.vmNetworkAdapters.indexOf(vmNetworkAdapter);
      vm.reconfigureModel.vmNetworkAdapters.splice(index, 1);
    }
    vm.updateNetworkAdaptersAddRemove();
  };

  vm.addDisk = function() {
    vm.reconfigureModel.vmdisks.push({
      hdFilename: '',
      hdType: vm.reconfigureModel.hdType,
      hdMode: vm.reconfigureModel.hdMode,
      hdSize: vm.reconfigureModel.hdSize,
      hdUnit: vm.reconfigureModel.hdUnit,
      new_controller_type: vm.reconfigureModel.new_controller_type,
      cb_dependent: vm.reconfigureModel.cb_dependent,
      cb_bootable: vm.reconfigureModel.cb_bootable,
      add_remove: 'add'});
    vm.resetAddValues();
    vm.updateDisksAddRemove();
  };

  vm.enableDiskAdd = function() {
    vm.resetAddValues();
    vm.reconfigureModel.addEnabled = true;
  };

  vm.hideAddDisk = function() {
    vm.reconfigureModel.addEnabled = false;
    vm.resetAddValues();
  };

  vm.enableResizeDisk = function(disk) {
    disk.add_remove = 'resizing';
  };

  vm.resizeDisk = function(disk) {
    disk.add_remove = 'resize';
    vm.updateDisksAddRemove();
  };

  vm.resizeDiskUnitChanged = function(disk) {
    if (disk.hdUnit === 'MB') {
      disk.hdSize = disk.hdSize * 1024;
    } else if ((disk.hdSize % 1024) === 0) {
      disk.hdSize = disk.hdSize / 1024;
    } else {
      disk.hdSize = '';
    }
  };

  vm.deleteDisk = function(name) {
    for (var disk in vm.reconfigureModel.vmdisks) {
      if (vm.reconfigureModel.vmdisks[disk].hdFilename === name) {
        vm.reconfigureModel.vmdisks[disk].add_remove = 'remove';
      }
    }
    vm.updateDisksAddRemove();
  };

  vm.cancelAddRemoveDisk = function(vmDisk) {
    switch (vmDisk.add_remove) {
      case 'remove':
        vmDisk.add_remove = '';
        vmDisk.cb_deletebacking = false;
        vmDisk.cb_bootable = false;
        break;
      case 'resize':
      case 'resizing':
        vmDisk.add_remove = '';
        vmDisk.hdSize = vmDisk.orgHdSize;
        vmDisk.hdUnit = vmDisk.orgHdUnit;
        break;
      case 'add':
        var index = vm.reconfigureModel.vmdisks.indexOf(vmDisk);
        vm.reconfigureModel.vmdisks.splice(index, 1);
        break;
      default:
        break;
    }
    vm.updateDisksAddRemove();
  };

  var reconfigureEditButtonClicked = function(buttonName, serializeFields) {
    miqService.sparkleOn();
    var url = 'reconfigure_update/' + reconfigureFormId + '?button=' + buttonName;
    if (typeof serializeFields === 'undefined') {
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
        vmRemoveDisks: vm.reconfigureModel.vmRemoveDisks,
        vmResizeDisks: vm.reconfigureModel.vmResizeDisks,
        vmAddNetworkAdapters: vm.reconfigureModel.vmAddNetworkAdapters,
        vmRemoveNetworkAdapters: vm.reconfigureModel.vmRemoveNetworkAdapters,
        vmConnectCDRoms: vm.reconfigureModel.vmConnectCDRoms,
        vmDisconnectCDRoms: vm.reconfigureModel.vmDisconnectCDRoms,
      });
    }
  };

  vm.cancelClicked = function() {
    miqService.sparkleOn();
    miqService.miqAjaxButton('reconfigure_update?button=cancel');
  };

  vm.resetClicked = function() {
    $scope.$broadcast('resetClicked');
    vm.reconfigureModel = angular.copy(vm.modelCopy);
    vm.cb_memory = vm.cb_memoryCopy;
    vm.cb_cpu = vm.cb_cpuCopy;
    vm.mem_type_prev = vm.reconfigureModel.memory_type;

    angular.forEach(vm.reconfigureModel.vmdisks, function(disk) {
      vm.cancelAddRemoveDisk(disk);
    });

    angular.forEach(vm.reconfigureModel.vmCDRoms, function(cd) {
      vm.cancelCDRomConnectDisconnect(cd);
    });

    $scope.angularForm.$setPristine(true);
    vm.updateDisksAddRemove();
    vm.updateCDRomsConnectDisconnect();

    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.submitClicked = function() {
    // change memory value based ontype
    reconfigureEditButtonClicked('submit', true);
  };

  vm.addClicked = function() {
    vm.submitClicked();
  };

  vm.isVmwareCloud = function() {
    return vm.vm_vendor === 'vmware' && vm.vm_type.includes('CloudManager');
  };

  vm.fetchAvailableAdapterNetworks = function(orchestrationStackId) {
    API.get('/api/cloud_networks?expand=resources&attributes=name&filter[]=orchestration_stack_id=' + orchestrationStackId).then(function(data) {
      vm.reconfigureModel.availableAdapterNetworks = data.resources.map(function(network) { return network.name; });
    }).catch(miqService.handleFailure);
  };

  function getReconfigureFormData(response) {
    var data = response.data;
    vm.reconfigureModel.memory                 = data.memory;
    vm.reconfigureModel.memory_type            = data.memory_type;
    vm.reconfigureModel.socket_count           = data.socket_count;
    vm.reconfigureModel.cores_per_socket_count = data.cores_per_socket_count;
    vm.mem_type_prev                           = vm.reconfigureModel.memory_type;
    vm.cb_memory                               = data.cb_memory;
    vm.cb_cpu                                  = data.cb_cpu;
    vm.reconfigureModel.vmdisks                = angular.copy(data.disks);
    vm.reconfigureModel.vmNetworkAdapters      = angular.copy(data.network_adapters);
    vm.reconfigureModel.vmCDRoms               = angular.copy(data.cdroms);
    vm.vm_vendor                               = data.vm_vendor;
    vm.vm_type                                 = data.vm_type;
    vm.disk_default_type                       = data.disk_default_type;
    vm.updateDisksAddRemove();
    vm.updateNetworkAdaptersAddRemove();
    vm.updateCDRomsConnectDisconnect();

    angular.forEach(vm.reconfigureModel.vmdisks, function(disk) {
      if (typeof disk !== 'undefined') {
        disk.orgHdSize = disk.hdSize;
        disk.orgHdUnit = disk.hdUnit;
        if ( disk.add_remove !== 'add' && disk.add_remove !== 'remove' ) {
          disk.delete_backing = false;
        }
      }
    });
    if (data.socket_count && data.cores_per_socket_count) {
      vm.reconfigureModel.total_cpus = (parseInt(vm.reconfigureModel.socket_count, 10) * parseInt(vm.reconfigureModel.cores_per_socket_count, 10)).toString();
    }

    angular.forEach(vm.reconfigureModel.vmCDRoms, function(cdRom) {
      if (typeof cdRom !== 'undefined') {
        cdRom.orgFilename = cdRom.filename;
        cdRom.connect_disconnect = '';
        cdRom.connected = cdRom.device_type === 'cdrom_image';
      }
    });

    if (data.socket_count && data.cores_per_socket_count) {
      vm.reconfigureModel.total_cpus = (parseInt(vm.reconfigureModel.socket_count, 10) * parseInt(vm.reconfigureModel.cores_per_socket_count, 10)).toString();
    }

    if (vm.isVmwareCloud()) {
      vm.fetchAvailableAdapterNetworks(data.orchestration_stack_id);
    }

    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.reconfigureModel );
    vm.cb_memoryCopy = vm.cb_memory;
    vm.cb_cpuCopy = vm.cb_cpu;
    miqService.sparkleOff();
  }

  vm.updateCDRomsConnectDisconnect = function() {
    vm.reconfigureModel.vmConnectCDRoms = [];
    vm.reconfigureModel.vmDisconnectCDRoms = [];
    angular.forEach(vm.reconfigureModel.vmCDRoms, function(cdRom) {
      if (cdRom.connect_disconnect === 'connect') {
        vm.reconfigureModel.vmConnectCDRoms.push(
          { device_name: cdRom.device_name,
            filename: cdRom.filename,
            storage_id: cdRom.storage_id,
          }
        );
      }
      if (cdRom.connect_disconnect === 'disconnect') {
        vm.reconfigureModel.vmDisconnectCDRoms.push(
          { device_name: cdRom.device_name });
      }
    });
    vm.cb_cdRoms = vm.reconfigureModel.vmConnectCDRoms.length > 0  ||
      vm.reconfigureModel.vmDisconnectCDRoms.length > 0;
  };


  vm.connectCDRom = function(cdRom) {
    var iso = vm.selected_iso.split(',');
    cdRom.filename = iso[0];
    cdRom.storage_id = iso[1];
    cdRom.connect_disconnect = 'connect';
    vm.updateCDRomsConnectDisconnect();
  };

  vm.disconnectCDRom = function(cdRom) {
    cdRom.connect_disconnect = 'disconnect';
    cdRom.filename = '';
    vm.updateCDRomsConnectDisconnect();
  };

  vm.enableConnectCDRom = function(cdRom) {
    cdRom.connect_disconnect = 'connecting';
  };

  vm.enableDisconnectCDRom = function(cdRom) {
    cdRom.filename = '';
    cdRom.connect_disconnect = 'disconnecting';
  };

  vm.cancelCDRomConnectDisconnect = function(vmCDRom) {
    var index = vm.reconfigureModel.vmCDRoms.indexOf(vmCDRom);
    vmCDRom.filename = vmCDRom.orgFilename;
    vmCDRom.connect_disconnect = '';
    vm.reconfigureModel.vmCDRoms[index].connect_disconnect = '';
  };

  init();
}]);
