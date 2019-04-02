describe('namespace-form', function() {
  var $componentController, miqService, vm;

  describe('when vm.namespaceId is new', function () {
    beforeEach(module('ManageIQ'));
    beforeEach(inject(function (_$componentController_, _miqService_) {
      $componentController = _$componentController_;
      miqService = _miqService_;

      spyOn(miqService, 'miqAjaxButton');

      var bindings = {aeNsDomain: false,
                      namespacePath: 'parent/',
                      namespaceId: "new",
                      nameReadonly: false,
                      descriptionReadonly: false};
      vm = $componentController('namespaceForm', null, bindings);
      vm.$onInit();
    }));

    it('sets newRecord to true', function () {
      expect(vm.newRecord).toBe(true);
    });

    it('adds a Namespace record', function () {
      vm.namespaceModel.name = "name";
      vm.namespaceModel.description = "description";
      vm.addClicked();
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/miq_ae_class/create_namespace/new?button=add', vm.namespaceModel, { complete: false });
    });
  });
  describe('when namespace exists', function () {
    beforeEach(module('ManageIQ'));
    beforeEach(inject(function (_$componentController_, _miqService_, _$httpBackend_) {
      $componentController = _$componentController_;
      miqService = _miqService_;
      var $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('/miq_ae_class/namespace/123').respond({name: "Name", description: "Description"});

      spyOn(miqService, 'miqAjaxButton');
      spyOn(miqService, 'miqFlash');

      var bindings = {aeNsDomain: false,
                      namespacePath: 'parent/',
                      namespaceId: "123",
                      nameReadonly: false,
                      descriptionReadonly: false};
      vm = $componentController('namespaceForm', null, bindings);
      vm.$onInit();
      $httpBackend.flush();
    }));

    it('sets newRecord to true', function () {
      expect(vm.newRecord).toBe(false);
    });

    it('sets namespaceModel correctly', function () {
      expect(vm.namespaceModel).toEqual({name: "Name", description: "Description"});
    });

    it('updates a Namespace record', function () {
      vm.namespaceModel.name = 'Changed name';
      vm.namespaceModel.name = 'Changed description';
      vm.saveClicked();
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/miq_ae_class/update_namespace/123?button=save', vm.namespaceModel, { complete: false });
    });

    it('#reset resets form correctly', function () {
      var angularForm = {
        $setPristine: function(value) {},
        $setUntouched: function(value) {},
      };

      vm.namespaceModel.name = 'Changed name';
      vm.namespaceModel.name = 'Changed description';
      vm.resetClicked(angularForm);
      expect(miqService.miqFlash).toHaveBeenCalledWith('warn', 'All changes have been reset');
      expect(vm.namespaceModel).toEqual({name: "Name", description: "Description"});
    });
  });
});
