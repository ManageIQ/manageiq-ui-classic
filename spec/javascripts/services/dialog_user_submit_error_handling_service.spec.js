describe('dialogUserSubmitErrorHandlerService', function() {
  var testService, miqService;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(dialogUserSubmitErrorHandlerService, _miqService_) {
    testService = dialogUserSubmitErrorHandlerService;
    miqService = _miqService_;
  }));

  describe('#handleError', function() {
    var errorData;

    beforeEach(function() {
      errorData = {data: {error: {message: "Failed! -One,Two"}}};
      spyOn(miqService, 'sparkleOff');
      spyOn(window, 'clearFlash');
      spyOn(window, 'add_flash');
    });

    it('turns off the sparkle', function() {
      testService.handleError(errorData);
      expect(miqService.sparkleOff).toHaveBeenCalled();
    });

    it('clears flash messages', function() {
      testService.handleError(errorData);
      expect(window.clearFlash).toHaveBeenCalled();
    });

    it('adds flash messages for each message after the -', function() {
      testService.handleError(errorData);
      expect(window.add_flash).toHaveBeenCalledWith('One', 'error');
      expect(window.add_flash).toHaveBeenCalledWith('Two', 'error');
    });

    it('returns the error data to bubble up to the parent', function() {
      expect(testService.handleError(errorData)).toEqual(errorData);
    });
  });
});
