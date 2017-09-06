describe('dialogUserController', function() {
  var $controller, API, dialogFieldRefreshService, serviceTemplateId, serviceTemplateCatalogId;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(_$controller_, _API_, _dialogFieldRefreshService_) {
    API = _API_;
    dialogFieldRefreshService = _dialogFieldRefreshService_;

    var responseResult = {
      resources: [{
        content: ['the dialog']
      }]
    };

    spyOn(API, 'get').and.callFake(function() {
      return {then: function(response) { response(responseResult); }};
    });
    spyOn(dialogFieldRefreshService, 'refreshField');

    $controller = _$controller_('dialogUserController', {
      API: API,
      dialogFieldRefreshService: dialogFieldRefreshService,
      serviceTemplateId: '123',
      serviceTemplateCatalogId: '321'
    });
  }));

  describe('$onInit', function() {
    beforeEach(function() {
      $controller.$onInit();
    });

    it('requests the current dialog based on the service template', function() {
      expect(API.get).toHaveBeenCalledWith('/api/service_templates/123/service_dialogs?expand=resources&attributes=content');
    });

    it('resolves the request and stores the information in the dialog property', function() {
      expect($controller.dialog).toEqual('the dialog');
    });

    it('sets the refreshUrl', function() {
      expect($controller.refreshUrl).toEqual('/api/service_catalogs/321/service_templates/');
    });
  });

  describe('refreshField', function() {
    it('delegates to the dialogFieldRefreshService', function() {
      $controller.dialogData = 'dialogData';

      $controller.refreshField({name: 'dialogName'});
      expect(dialogFieldRefreshService.refreshField).toHaveBeenCalledWith(
        'dialogData',
        ['dialogName'],
        '/api/service_catalogs/321/service_templates/',
        '123'
      );
    });
  });

  describe('setDialogData', function() {
    it('sets the data attribute of the data passed in to dialogData', function() {
      expect($controller.dialogData).toEqual(undefined);

      $controller.setDialogData({data: 'newData'});

      expect($controller.dialogData).toEqual('newData');
    });
  });
});
