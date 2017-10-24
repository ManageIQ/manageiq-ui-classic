describe('dialogUserController', function() {
  var $controller, API, dialogFieldRefreshService, miqService, serviceTemplateId, serviceTemplateCatalogId;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(_$controller_, _API_, _dialogFieldRefreshService_, _miqService_) {
    API = _API_;
    dialogFieldRefreshService = _dialogFieldRefreshService_;
    miqService = _miqService_;

    var responseResult = {
      resources: [{
        content: ['the dialog']
      }]
    };

    spyOn(API, 'get').and.callFake(function() {
      return {then: function(response) { response(responseResult); }};
    });

    spyOn(dialogFieldRefreshService, 'refreshField');
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'redirectBack');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');

    $controller = _$controller_('dialogUserController', {
      API: API,
      dialogFieldRefreshService: dialogFieldRefreshService,
      miqService: miqService,
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

  describe('submitButtonClicked', function() {
    beforeEach(function() {
      $controller.setDialogData({data: {field1: 'field1'}});
    });

    context('when the API call succeeds', function() {
      beforeEach(function() {
        spyOn(API, 'post').and.returnValue(Promise.resolve('awesome'));
      });

      it('starts the sparkle', function(done) {
        $controller.submitButtonClicked();

        setTimeout(function() {
          expect(miqService.sparkleOn).toHaveBeenCalled();
          done();
        });
      });

      it('posts to the API using the correct url and data', function(done) {
        $controller.submitButtonClicked();

        setTimeout(function() {
          expect(API.post).toHaveBeenCalledWith('/api/service_catalogs/321/service_templates/123', {
            action: 'order',
            field1: 'field1'
          });
          done();
        });
      });

      it('redirects to the miq_request screen', function(done) {
        $controller.submitButtonClicked();
        setTimeout(function() {
          expect(miqService.redirectBack).toHaveBeenCalledWith('Service ordered successfully!', 'info', '/miq_request?typ=service');
          done();
        });
      });
    });

    context('when the API call fails', function() {
      beforeEach(function() {
        spyOn(API, 'post').and.returnValue(Promise.reject('not awesome'));
        spyOn(window, 'add_flash');
      });

      it('turns off the sparkle', function(done) {
        $controller.submitButtonClicked();
        setTimeout(function() {
          expect(miqService.sparkleOff).toHaveBeenCalled();
          done();
        });
      });

      it('adds a flash message', function(done) {
        $controller.submitButtonClicked();

        setTimeout(function() {
          expect(window.add_flash).toHaveBeenCalledWith('Error requesting data from server', 'error');
          done();
        });
      });
    });
  });

  describe('cancelClicked', function() {
    it('uses the miqService to make a call to catalog/explorer', function() {
      $controller.cancelClicked('event');
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/catalog/explorer');
    });
  });

  describe('saveable', function() {
    context('when fields are being refreshed', function() {
      beforeEach(function() {
        dialogFieldRefreshService.areFieldsBeingRefreshed = true;
      });

      it('returns false', function() {
        expect($controller.saveable()).toBe(false);
      });
    });

    context('when fields are not being refrshed', function() {
      beforeEach(function() {
        dialogFieldRefreshService.areFieldsBeingRefreshed = false;
      });

      it('returns true', function() {
        expect($controller.saveable()).toBe(true);
      });
    });
  });
});
