ManageIQ.angular.app.service('dialogUserSubmitErrorHandlerService', ['miqService', function(miqService) {
  this.handleError = function(err) {
    miqService.sparkleOff();
    var fullErrorMessage = err.data.error.message;
    var allErrorMessages = fullErrorMessage.split('-')[1].split(',');
    clearFlash();
    _.forEach(allErrorMessages, function(errorMessage) {
      add_flash(errorMessage, 'error');
    });
    console.error(err);
    return err;
  };
}]);
