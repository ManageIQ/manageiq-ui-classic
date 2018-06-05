describe('dialogUserController', function() {
  var $controller, API, dialogFieldRefreshService, miqService;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(_$controller_, _API_, _dialogFieldRefreshService_, _miqService_) {
    API = _API_;
    dialogFieldRefreshService = _dialogFieldRefreshService_;
    miqService = _miqService_;

    var responseResult = {content: ['the dialog']};

    spyOn(API, 'get').and.callFake(function() {
      return {then: function(response) { response(responseResult); }};
    });

    spyOn(dialogFieldRefreshService, 'refreshField');
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'redirectBack');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');
    spyOn(miqService, 'refreshSelectpicker');

    $controller = _$controller_('dialogUserController', {
      API: API,
      dialogFieldRefreshService: dialogFieldRefreshService,
      miqService: miqService,
      dialogId: '1234',
      apiSubmitEndpoint: 'submit endpoint',
      apiAction: 'order',
      cancelEndpoint: 'cancel endpoint',
      finishSubmitEndpoint: 'finish submit endpoint',
      resourceActionId: '789',
      targetId: '987',
      targetType: 'targettype',
    });
  }));

  describe('$onInit', function() {
    beforeEach(function() {
      $controller.$onInit();
    });

    it('requests the current dialog based on the service template', function() {
      expect(API.get).toHaveBeenCalledWith(
        '/api/service_dialogs/1234?resource_action_id=789&target_id=987&target_type=targettype',
        {expand: 'resources', attributes: 'content'}
      );
    });

    it('resolves the request and stores the information in the dialog property', function() {
      expect($controller.dialog).toEqual('the dialog');
    });

    it('sets the refreshUrl', function() {
      expect($controller.refreshUrl).toEqual('/api/service_dialogs/');
    });

    it('sets dialogLoaded to true', function() {
      expect($controller.dialogLoaded).toEqual(true);
    });

    it('refreshes the selectpickers after resolving the api call', function(done) {
      setTimeout(function() {
        expect(miqService.refreshSelectpicker).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('refreshField', function() {
    it('delegates to the dialogFieldRefreshService', function() {
      $controller.dialogData = 'dialogData';

      $controller.refreshField({name: 'dialogName'});
      expect(dialogFieldRefreshService.refreshField).toHaveBeenCalledWith(
        'dialogData',
        ['dialogName'],
        '/api/service_dialogs/',
        {dialogId: '1234', resourceActionId: '789', targetId: '987', targetType: 'targettype'}
      );
    });
  });

  describe('setDialogData', function() {
    it('sets the data attribute of the data passed in to dialogData', function() {
      expect($controller.dialogData).toEqual(undefined);

      $controller.setDialogData({data: 'newData', validations: { isValid : true}});

      expect($controller.dialogData).toEqual('newData');
    });
  });

  describe('submitButtonClicked', function() {
    beforeEach(function() {
      $controller.setDialogData({data: {field1: 'field1'}, validations: { isValid : true}});
    });

    context('when the submit endpoint deals with generic objects', function() {
      beforeEach(inject(function(_$controller_) {
        $controller = _$controller_('dialogUserController', {
          API: API,
          dialogFieldRefreshService: dialogFieldRefreshService,
          miqService: miqService,
          dialogId: '1234',
          apiSubmitEndpoint: 'service/explorer',
          apiAction: 'custom_action',
          cancelEndpoint: 'cancel endpoint',
          finishSubmitEndpoint: 'finish submit endpoint',
          resourceActionId: '789',
          targetId: '987',
          targetType: 'targettype',
          saveable: true,
        });

        $controller.setDialogData({data: {field1: 'field1'}, validations: { isValid : true}});

        spyOn(API, 'post').and.returnValue(Promise.resolve('awesome'));
      }));

      it('posts to the API with the right data', function(done) {
        $controller.submitButtonClicked();

        setTimeout(function() {
          expect(API.post).toHaveBeenCalledWith('service/explorer', {
            field1: 'field1', action: 'custom_action'}, {skipErrors: [400]});
          done();
        });
      });
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
          expect(API.post).toHaveBeenCalledWith('submit endpoint', {
            action: 'order',
            field1: 'field1'
          }, {skipErrors: [400]});
          done();
        });
      });

      it('redirects to the miq_request screen', function(done) {
        $controller.submitButtonClicked();
        setTimeout(function() {
          expect(miqService.redirectBack).toHaveBeenCalledWith(
            'Order Request was Submitted', 'info', 'finish submit endpoint'
          );
          done();
        });
      });
    });

    context('when the API call fails', function() {
      beforeEach(function() {
        var rejectionData = {data: {error: {message: "Failed! -One,Two"}}};
        spyOn(API, 'post').and.returnValue(Promise.reject(rejectionData));
        spyOn(window, 'clearFlash');
        spyOn(window, 'add_flash');
      });

      it('turns off the sparkle', function(done) {
        $controller.submitButtonClicked();
        setTimeout(function() {
          expect(miqService.sparkleOff).toHaveBeenCalled();
          done();
        });
      });

      it('clears flash messages', function(done) {
        $controller.submitButtonClicked();

        setTimeout(function() {
          expect(window.clearFlash).toHaveBeenCalled();
          done();
        });
      });

      it('adds flash messages for each message after the -', function(done) {
        $controller.submitButtonClicked();

        setTimeout(function() {
          expect(window.add_flash).toHaveBeenCalledWith('One', 'error');
          expect(window.add_flash).toHaveBeenCalledWith('Two', 'error');
          done();
        });
      });
    });
  });

  describe('cancelClicked', function() {
    it('uses the miqService to make a call to catalog/explorer', function() {
      $controller.cancelClicked('event');
      expect(miqService.redirectBack).toHaveBeenCalledWith('Dialog Cancelled', 'info', 'cancel endpoint');
    });
  });

  describe('saveable', function() {
    context('when fields are being refreshed', function() {
      beforeEach(function() {
        dialogFieldRefreshService.areFieldsBeingRefreshed = true;
        $controller.isValid = true;
      });

      it('returns false', function() {
        expect($controller.saveable()).toBe(false);
      });
    });

    context('when fields are not being refreshed', function() {
      beforeEach(function() {
        dialogFieldRefreshService.areFieldsBeingRefreshed = false;
        $controller.isValid = true;
      });

      it('returns true', function() {
        expect($controller.saveable()).toBe(true);
      });
    });
  });
});
