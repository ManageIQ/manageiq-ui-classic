describe('change-password', function() {
  var $componentController, vm, miqService, API;

  describe('load page', function() {
    beforeEach(module('ManageIQ'));
    beforeEach(inject(function(_$componentController_, _API_, _miqService_, $q) {
      $componentController = _$componentController_;
      API = _API_;
      miqService = _miqService_;

      spyOn(miqService.redirectBack, 'bind');
      var deferred = $q.defer();
      spyOn(API, 'post').and.callFake(function() {return deferred.promise;});

      var bindings = {recordId: '1111', redirectUrl: '/controller/go_back', recordName: 'provider'};
      vm = $componentController('changePassword', null, bindings);
      vm.$onInit();
    }));

    it('sets saveable to false', function() {
      expect(vm.saveable()).toBe(false);
    });

    it('identifies errors in user entries', function() {
      vm.model.current_password = 'current_password';
      vm.model.new_password = 'current_password';
      vm.model.confirm_password = 'different_confirm_password';
      vm.model.name = 'xyz';

      expect(vm.confirmation_and_new_password_are_different()).toBe(true);
      expect(vm.current_and_new_password_are_equals()).toBe(true);
    });

    it('saves the new password', function() {
      vm.model.current_password = 'current_password';
      vm.model.new_password = 'pass';
      vm.model.confirm_password = 'pass';
      vm.recordName = 'xyz';

      expect(vm.confirmation_and_new_password_are_different()).toBe(false);
      expect(vm.current_and_new_password_are_equals()).toBe(false);

      vm.saveClicked();
      expect(API.post).toHaveBeenCalledWith('/api/providers/1111', vm.model, {
        skipErrors: [400],
      });
      expect(miqService.redirectBack.bind).toHaveBeenCalledWith(vm, 'Requested password change for the Physical Provider \"xyz\".', 'success', vm.redirectUrl);
    });
  });
});
