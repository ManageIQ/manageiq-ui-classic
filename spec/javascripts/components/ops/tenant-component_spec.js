describe('tenant-component', function() {
  var $componentController, vm, miqService, API;

  describe('when the vm.recordId is not defined', function () {

    beforeEach(module('ManageIQ'));
    beforeEach(inject(function (_$componentController_, _API_, _miqService_, $q) {
      $componentController = _$componentController_;
      API = _API_;
      miqService = _miqService_;

      spyOn(miqService.redirectBack, 'bind');

      var deferred = $q.defer();
      spyOn(API, 'post').and.callFake(function() {return deferred.promise;});

      var bindings = {redirectUrl: '/controller/go_back', divisible: true};
      vm = $componentController('tenantComponent', null, bindings);
      vm.$onInit();
    }));

    it('sets newRecord to true', function () {
      expect(vm.newRecord).toBe(true);
    });

    it('sets afterGet', function () {
      expect(vm.afterGet).toBe(true);
    });

    it('adds a Tenant record', function () {
      vm.tenantModel.name = 'newTenant';
      vm.tenantModel.description = 'newTenant_desc';
      vm.tenantModel.parent = null;
      vm.addClicked();
      expect(API.post).toHaveBeenCalledWith('/api/tenants/', {name: vm.tenantModel.name, description: vm.tenantModel.description, divisible: true, parent: {id: vm.tenantModel.parent}});
      expect(miqService.redirectBack.bind).toHaveBeenCalledWith(vm, 'Tenant \"newTenant\" has been successfully added.', 'success', vm.redirectUrl, true);
    });
  });

  describe('when the vm.recordId is defined', function () {
    beforeEach(module('ManageIQ'));
    beforeEach(inject(function (_$componentController_, _API_, _miqService_) {
      $componentController = _$componentController_;
      API = _API_;
      miqService = _miqService_;

      spyOn(miqService.redirectBack, 'bind');

      var tenantFormResponse = {
        name: 'abc',
        description: 'abc_desc',
        divisible: true
      };

      spyOn(API, 'get').and.callFake(function() {
        return {
          then: function (callback) {
            callback(tenantFormResponse);
            return {catch: function() {}};
          }
        };
      });

      spyOn(API, 'put').and.callFake(function() {
        return {
          then: function () {
            miqService.redirectBack();
            return {catch: function() {}};
          }
        };
      });

      var bindings = {recordId: 1111, redirectUrl: '/controller/go_back', divisible: true};
      vm = $componentController('tenantComponent', null, bindings);
      vm.$onInit();
    }));

    it('sets newRecord to true', function () {
      expect(vm.newRecord).toBe(false);
    });

    it('calls API.get with the appropriate URL', function () {
      expect(API.get).toHaveBeenCalledWith('/api/tenants/1111');
    });

    it('sets vm.tenantModel.name', function () {
      expect(vm.tenantModel.name).toBe('abc');
    });

    it('sets vm.tenantModel.description', function () {
      expect(vm.tenantModel.description).toBe('abc_desc');
    });

    it('updates a Tenant record', function () {
      vm.tenantModel.name = 'xyz';
      vm.tenantModel.description = 'xyz_desc';
      vm.saveClicked();
      expect(API.put).toHaveBeenCalledWith('/api/tenants/1111', {name: vm.tenantModel.name, description: vm.tenantModel.description});
      expect(miqService.redirectBack.bind).toHaveBeenCalledWith(vm, 'Tenant \"xyz\" has been successfully saved.', 'success', vm.redirectUrl, true);
    });
  });
});
