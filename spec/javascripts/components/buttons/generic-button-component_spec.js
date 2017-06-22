describe('generic-button-component', function() {
  var $scope, $componentController, vm, miqService, API;

  describe('Reset and Cancel specs', function () {

    beforeEach(module('ManageIQ'));
    beforeEach(inject(function ($compile, $rootScope, _$componentController_, _API_, _miqService_, $q) {
      $componentController = _$componentController_;
      miqService = _miqService_;

      spyOn(miqService, 'miqFlash');
      spyOn(miqService, 'redirectBack');

      $scope = $rootScope;
      var element = angular.element(
        '<form name="angularForm">' +
        '<generic-button-component angular-form="angularForm"></generic-button-component>' +
        '</form>'
      );
      $compile(element)($rootScope);

      var bindings = {
        angularForm: $scope.angularForm,
        model: {name: 'abc', desc: 'abc_desc'},
        modelCopy: {name: 'abc_orig', desc: 'abc_desc_orig'},
        redirectUrl: '/controller/go_back',
        entity: 'Project',
        entityName: 'xyz'};
      vm = $componentController('genericButtonComponent', null, bindings);
      vm.$onInit();
    }));

    it('sets vm.angularForm', function () {
      expect(vm.angularForm).toBeDefined();
    });

    it('sets vm.saveable', function () {
      expect(vm.saveable).toBeDefined();
    });

    it('resets the form', function () {
      vm.resetClicked();
      expect(vm.model).toEqual(vm.modelCopy);
      expect(vm.angularForm.$pristine).toBeTruthy();
      expect(vm.angularForm.$touched).toBeFalsy();
      expect(miqService.miqFlash).toHaveBeenCalledWith('warn', __('All changes have been reset'));
    });

    it('cancels a new form', function () {
      vm.newRecord = true;
      vm.cancelClicked();
      expect(miqService.redirectBack).toHaveBeenCalledWith('Creation of new Project was canceled by the user.', 'warning', vm.redirectUrl);
    });

    it('cancels an edit form', function () {
      vm.newRecord = false;
      vm.cancelClicked();
      expect(miqService.redirectBack).toHaveBeenCalledWith('Edit of Project \"xyz\" was canceled by the user.', 'warning', vm.redirectUrl);
    });
  });
});
