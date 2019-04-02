describe('orchestrationTemplateCopyController', function() {
  var $scope, vm, $httpBackend, miqService;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function($rootScope, _$controller_, _$httpBackend_, _miqService_) {
    miqService = _miqService_;
    spyOn(miqService, 'miqFlash');
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');
    $scope = $rootScope.$new();

    setFixtures('<html><head></head><body></body></html>');
    ManageIQ.editor = CodeMirror(document.body);

    $httpBackend = _$httpBackend_;

    var retirementFormResponse = {
      template_id: 1000000000001,
      template_name: 'template_name',
      template_description: 'template_description',
      template_draft: 'true',
      template_content: 'template_content',
    };
    $httpBackend.whenGET('/orchestration_stack/stacks_ot_info/1000000000001').respond(retirementFormResponse);
    vm = _$controller_('orchestrationTemplateCopyController', {
      $scope: $scope,
      stackId: 1000000000001,
      miqService: miqService
    });
    $httpBackend.flush();
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('initialization', function() {
    it('sets the templateInfo to the values returned with http request', function() {
      expect(vm.templateInfo.templateId).toEqual(1000000000001);
      expect(vm.templateInfo.templateName).toEqual('Copy of template_name');
      expect(vm.templateInfo.templateDescription).toEqual('template_description');
      expect(vm.templateInfo.templateDraft).toEqual('true');
      expect(vm.templateInfo.templateContent).toEqual('template_content');
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

    it('turns the spinner on once', function() {
      expect(miqService.sparkleOn.calls.count()).toBe(1);
    });

    it('delegates to miqService.miqAjaxButton', function() {
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/orchestration_stack/stacks_ot_copy?button=cancel&id=' + vm.stackId);
    });
  });

  describe('#addClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function (value){}
      };
      vm.addClicked();
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });

    it('turns the spinner on once', function() {
      expect(miqService.sparkleOn.calls.count()).toBe(1);
    });

    it('delegates to miqService.miqAjaxButton', function() {
      var addContent = {
        templateId: vm.templateInfo.templateId,
        templateName: vm.templateInfo.templateName,
        templateDescription: vm.templateInfo.templateDescription,
        templateDraft: vm.templateInfo.templateDraft,
        templateContent: vm.templateInfo.templateContent
      };
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/orchestration_stack/stacks_ot_copy?button=add', addContent);
    });
  });
});
