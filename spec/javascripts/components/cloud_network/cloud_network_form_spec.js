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
      expect(vm.afterGet).toBe(true);
    });

    it('adds a Cloud Network record', function () {
      vm.cloudNetworkModel.name = 'newNetwork';
      vm.cloudNetworkModel.description = 'newNetwork_desc';
      vm.cloudNetworkModel.ems_id = 1;
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
        name: 'abc',
        description: 'ABC desc'
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

    it('sets newRecord to true', function () {
      expect(vm.newRecord).toBe(false);
    });

    it('calls API.get with the appropriate URL', function () {
      expect(API.get).toHaveBeenCalledWith('/api/cloud_networks/1111?attributes=cloud_tenant,ext_management_system');
    });

    it('sets vm.cloudNetworkModel.name', function () {
      expect(vm.cloudNetworkModel.name).toBe('abc');
    });

    it('sets vm.cloudNetworkModel.description', function () {
      expect(vm.cloudNetworkModel.description).toBe('ABC desc');
    });

    it('updates a Cloud Network record', function () {

      vm.cloudNetworkModel.name = 'xyz';
      vm.cloudNetworkModel.description = 'XYZ Desc';
      vm.saveClicked();
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/cloud_network/update/1111?button=save', vm.cloudNetworkModel, { complete: false });
    });
  });
});
