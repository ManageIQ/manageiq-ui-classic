describe('tenant-form', function() {
  var $componentController, vm, miqService, API, $httpBackend, deferred;

  describe('when the vm.recordId is not defined', function () {

    beforeEach(module('ManageIQ'));
    beforeEach(inject(function (_$componentController_, _API_, _miqService_, $q, _$httpBackend_) {
      $componentController = _$componentController_;
      API = _API_;
      miqService = _miqService_;
      $httpBackend = _$httpBackend_;
      spyOn(miqService.redirectBack, 'bind');

      deferred = $q.defer();
      spyOn(API, 'post').and.callFake(function() {return deferred.promise;});

      var bindings = {redirectUrl: '/controller/go_back', divisible: true};
      vm = $componentController('tenantForm', null, bindings);
      vm.$onInit();
    }));

    it('sets newRecord to true', function () {
      expect(vm.newRecord).toBe(true);
    });

    it('sets afterGet', function () {
      expect(vm.afterGet).toBe(true);
    });

    it('adds a Tenant record', function () {
      $httpBackend.expectPOST('/ops/invalidate_miq_product_feature_caches').respond({});

      vm.tenantModel.name = 'newTenant';
      vm.tenantModel.description = 'newTenant_desc';
      vm.tenantModel.ancestry = null;
      vm.addClicked();

      expect(API.post).toHaveBeenCalledWith('/api/tenants/', {
        name: vm.tenantModel.name,
        description: vm.tenantModel.description,
        divisible: true,
        parent: {
          id: vm.tenantModel.ancestry,
        },
      }, {
        skipErrors: [400],
      });

      deferred.resolve({});

      expect(miqService.redirectBack.bind).toHaveBeenCalledWith(vm, 'Tenant \"newTenant\" has been successfully added.', 'success', vm.redirectUrl);
    });

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
    });
  });

  describe('when the vm.recordId is defined', function () {
    beforeEach(module('ManageIQ'));
    beforeEach(inject(function (_$componentController_, _API_, _miqService_, $q) {
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

      var deferred = $q.defer();
      spyOn(API, 'put').and.callFake(function() {return deferred.promise;});

      var bindings = {recordId: '1111', redirectUrl: '/controller/go_back', divisible: true};
      vm = $componentController('tenantForm', null, bindings);
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
      expect(API.put).toHaveBeenCalledWith('/api/tenants/1111', {
        name: vm.tenantModel.name,
        description: vm.tenantModel.description,
        use_config_for_attributes: vm.tenantModel.use_config_for_attributes,
      }, {
        skipErrors: [400],
      });
      expect(miqService.redirectBack.bind).toHaveBeenCalledWith(vm, 'Tenant \"xyz\" has been successfully saved.', 'success', vm.redirectUrl);
    });
  });
});
