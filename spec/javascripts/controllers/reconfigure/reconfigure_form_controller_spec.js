describe('reconfigureFormController', function() {
  var $scope, vm, $httpBackend, miqService;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function($rootScope, _$controller_, _$httpBackend_, _miqService_) {
    miqService = _miqService_;
    spyOn(miqService, 'miqFlash');
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');
    $scope = $rootScope.$new();
    var reconfigureFormResponse = {cb_memory:              'on',
      memory:                 '4196',
      memory_type:            'MB',
      cb_cpu:                 'on',
      socket_count:           '2',
      cores_per_socket_count: '3',
      disks:                 [{hdFilename: "test_disk.vmdk", hdType: "thick", hdMode: "persistent", new_controller_type: "VirtualLsiLogicController", hdSize: "0", hdUnit: "MB", add_remove: ""}],
      network_adapters:      [{name: "Network adapter 1", vlan: "test_network", mac: "00:00:00:00:00:00", add_remove: ""}],
      cdroms:                [{device_name: "CDROM 1", filename: "test_filename.iso", storage_id: '5', connect_disconnect: ""}],
      vm_vendor:              'vm-vendor',
      vm_type:                'vm-type',
      disk_default_type:      'disk-default-type'};

    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET('reconfigure_form_fields/1000000000003,1000000000001,1000000000002').respond(reconfigureFormResponse);
    vm = _$controller_('reconfigureFormController', {
      $scope: $scope,
      reconfigureFormId: '1000000000003',
      cb_memory:              false,
      cb_cpu:                 false,
      objectIds: [1000000000001,1000000000002],
      miqService: miqService
    });
    $httpBackend.flush();
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('initialization', function() {
    it('sets the reconfigure memory value to the value returned with http request', function() {
      expect(vm.reconfigureModel.memory).toEqual('4196');
    });

    it('sets the reconfigure socket count to the value returned with http request', function() {
      expect(vm.reconfigureModel.socket_count).toEqual('2');
    });

    it('sets the reconfigure cores per socket count to the value returned with http request', function() {
      expect(vm.reconfigureModel.cores_per_socket_count).toEqual('3');
    });

    it('sets the total socket count to the value calculated from the http request data', function() {
      expect(vm.reconfigureModel.total_cpus).toEqual('6');
    });

    it('initializes the delete_backing flag to false if not retrived', function() {
      expect(vm.reconfigureModel.vmdisks[0].delete_backing).toEqual(false);
    });
    it('sets the network adapter data to the network adapter data returned with the http request', function() {
      expect(vm.reconfigureModel.vmNetworkAdapters).toEqual([{name: "Network adapter 1", vlan: "test_network", mac: "00:00:00:00:00:00", add_remove: ""}]);
    });

    it('sets the vm vendor data to the data returned with the http request', function() {
      expect(vm.vm_vendor).toEqual('vm-vendor');
    });

    it('sets the vm type data to the data returned with the http request', function() {
      expect(vm.vm_type).toEqual('vm-type');
    });

    it('sets the vm disk_default_type to the data returned with the http request', function() {
      expect(vm.disk_default_type).toEqual('disk-default-type');
    });
  });

  describe('#cancelClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function(value) {}
      };
      vm.cancelClicked();
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });

    it('delegates to miqService.miqAjaxButton', function() {
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('reconfigure_update?button=cancel');
    });
  });

  describe('#submitClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function (value){}
      };
      vm.submitClicked();
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });

    it('delegates to miqService.miqAjaxButton', function() {
      var submitContent = {objectIds:              vm.objectIds,
                           cb_memory:              vm.cb_memory,
                           cb_cpu:                 vm.cb_cpu,
                           memory:                 vm.reconfigureModel.memory,
                           memory_type:            vm.reconfigureModel.memory_type,
                           socket_count:           vm.reconfigureModel.socket_count,
                           cores_per_socket_count: vm.reconfigureModel.cores_per_socket_count,
                           vmAddDisks: [  ], vmRemoveDisks: [  ], vmResizeDisks: [  ],
                           vmAddNetworkAdapters: [  ], vmRemoveNetworkAdapters: [  ], vmEditNetworkAdapters: [  ],
                           vmConnectCDRoms: [  ], vmDisconnectCDRoms: [  ]};

      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('reconfigure_update/1000000000003?button=submit', submitContent);
    });
  });
});
