describe('cloud-subnet-form', function() {
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

      var bindings = {cloudSubnetFormId: 'new'};
      vm = $componentController('cloudSubnetForm', null, bindings);
      vm.$onInit();
    }));

    it('sets newRecord to true', function () {
      expect(vm.newRecord).toBe(true);
    });

    it('sets afterGet', function () {
      expect(vm.afterGet).toBe(false);
    });

    it('adds a Cloud Subnet record', function () {
      vm.cloudSubnetModel.name = 'newSubnet';
      vm.cloudSubnetModel.ip_version = 'ipv4';
      vm.cloudSubnetModel.ems_id = 1;
      vm.addClicked();
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('create/new?button=add', vm.cloudSubnetModel, { complete: false });
    });
  });

  describe('when vm.recordId is defined', function () {
    beforeEach(module('ManageIQ'));
    beforeEach(inject(function (_$componentController_, _API_, _miqService_, $q) {
      $componentController = _$componentController_;
      API = _API_;
      miqService = _miqService_;

      spyOn(miqService, 'miqAjaxButton');

      var cloudSubnetFormResponse = {
        name: 'abc',
        gateway_ip: '172.10.1.1'
      };

      spyOn(API, 'get').and.callFake(function() {
        return {
          then: function (callback) {
            callback(cloudSubnetFormResponse);
            return {catch: function() {}};
          }
        };
      });

      var bindings = {cloudSubnetFormId: 1111};
      vm = $componentController('cloudSubnetForm', null, bindings);
      vm.$onInit();
    }));

    it('sets newRecord to true', function () {
      expect(vm.newRecord).toBe(false);
    });

    it('calls API.get with the appropriate URL', function () {
      expect(API.get).toHaveBeenCalledWith('/api/cloud_subnets/1111?expand=resources&attributes=ext_management_system.name,cloud_tenant.name,cloud_network.name');
    });

    it('sets vm.cloudSubnetModel.name', function () {
      expect(vm.cloudSubnetModel.name).toBe('abc');
    });

    it('sets vm.cloudSubnetModel.gateway_ip', function () {
      expect(vm.cloudSubnetModel.gateway_ip).toBe('172.10.1.1');
    });

    it('updates a Cloud Subnet record', function () {

      vm.cloudSubnetModel.name = 'xyz';
      vm.cloudSubnetModel.gateway_ip = '172.10.1.1';
      vm.saveClicked();

      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/cloud_subnet/update/1111?button=save', vm.cloudSubnetModel, { complete: false });
    });
  });
});
