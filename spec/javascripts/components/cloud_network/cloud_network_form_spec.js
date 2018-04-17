describe('cloud-network-form', function() {
  var $componentController, vm, miqService, API;

  describe('when vm.recordId is not defined', function () {
    beforeEach(module('ManageIQ'));
    beforeEach(inject(function (_$componentController_, _API_, _miqService_, $q) {
      $componentController = _$componentController_;
      API = _API_;
      miqService = _miqService_;

      spyOn(miqService, 'miqAjaxButton');

      var deferred = $q.defer();
      spyOn(API, 'get').and.callFake(function() {return deferred.promise;});

      var bindings = {cloudNetworkFormId: 'new'};
      vm = $componentController('cloudNetworkForm', null, bindings);
      vm.$onInit();
    }));

    it('sets newRecord to true', function () {
      expect(vm.newRecord).toBe(true);
    });

    it('sets afterGet', function () {
      expect(vm.afterGet).toBe(false);
    });

    it('adds a Cloud Network record', function () {
      vm.cloudNetworkModel.name = 'newNetwork';
      vm.cloudNetworkModel.ems_id = 1;
      vm.cloudNetworkModel.id = 'new';
      vm.cloudNetworkModel.cloud_tenant = {id: 'tenant_id'};
      vm.cloudNetworkModel.admin_state_up = true;
      vm.cloudNetworkModel.enabled = true;
      vm.cloudNetworkModel.external_facing = false;
      vm.cloudNetworkModel.provider_network_type = 'vxlan';
      vm.cloudNetworkModel.shared = false;
      vm.cloudNetworkModel.vlan_transparent = false;
      vm.addClicked();
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('create/new?button=add', vm.cloudNetworkModel, { complete: false });
    });
  });

  describe('when vm.recordId is defined', function () {
    beforeEach(module('ManageIQ'));
    beforeEach(inject(function (_$componentController_, _API_, _miqService_, $q) {
      $componentController = _$componentController_;
      API = _API_;
      miqService = _miqService_;

      spyOn(miqService, 'miqAjaxButton');

      var cloudNetworkFormResponse = {
        id: 'id',
        name: 'test',
        enabled: true
      };

      spyOn(API, 'get').and.callFake(function() {
        return {
          then: function (callback) {
            callback(cloudNetworkFormResponse);
            return {catch: function() {}};
          }
        };
      });

      var bindings = {cloudNetworkFormId: 1111};
      vm = $componentController('cloudNetworkForm', null, bindings);
      vm.$onInit();
    }));

    it('sets newRecord to false', function () {
      expect(vm.newRecord).toBe(false);
    });

    it('calls API.get with the appropriate URL', function () {
      expect(API.get).toHaveBeenCalledWith('/api/cloud_networks/1111?attributes=cloud_tenant.id,cloud_tenant.name,ext_management_system.name');
    });

    it('sets vm.cloudNetworkModel.name', function () {
      expect(vm.cloudNetworkModel.name).toBe('test');
    });

    it('sets vm.cloudNetworkModel.enabled', function () {
      expect(vm.cloudNetworkModel.enabled).toBe(true);
    });

    it('updates a Cloud Network record', function () {
      vm.cloudNetworkModel.name = 'xyz';
      vm.saveClicked();
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/cloud_network/update/1111?button=save', vm.cloudNetworkModel, { complete: false });
    });
  });
});
