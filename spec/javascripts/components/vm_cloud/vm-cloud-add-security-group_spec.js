describe('vm-cloud-add-security-group', function() {
  var $componentController, vm, miqService, API;

  describe('when the vm.recordId is defined', function () {
    beforeEach(module('ManageIQ'));
    beforeEach(inject(function (_$componentController_, _API_, _miqService_, $q) {
      $componentController = _$componentController_;
      API = _API_;
      miqService = _miqService_;

      var formResponse = {
        cloud_tenant_id: '2222',
      };

      spyOn(API, 'get').and.callFake(function() {
        return {
          then: function (callback) {
            callback(formResponse);
            return {catch: function() {}};
          }
        };
      });

      var bindings = {recordId: '1111'};
      vm = $componentController('vmCloudAddSecurityGroup', null, bindings);
      vm.$onInit();
    }));

    it('calls API.get with the appropriate URL', function () {
      expect(API.get).toHaveBeenCalledWith('/api/instances/1111');
      expect(API.get).toHaveBeenCalledWith('/api/instances/1111/security_groups?expand=resources&attributes=id,name');
    });
  });
});
