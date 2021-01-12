/* global miqFlashLater */

ManageIQ.angular.app.service('postService', ['miqService', '$window', 'API', function(miqService, $window, API) {
  this.saveRecord = function(apiURL, redirectURL, object, successMsg) {
    return saveRecord(apiURL, redirectURL, object, successMsg, 'edit');
  };

  this.createRecord = function(apiURL, redirectURL, object, successMsg) {
    return saveRecord(apiURL, redirectURL, object, successMsg, 'create');
  };

  this.cancelOperation = function(redirectURL, msg) {
    miqFlashLater({ message: msg });
    $window.location.href = redirectURL;
  };


  function saveRecord(apiURL, redirectURL, object, successMsg, action) {
    miqService.sparkleOn();

    return API.post(apiURL, angular.toJson({
      action: action,
      resource: object,
    }), {
      skipErrors: [400],
    })
      .then(handleErrors)
      .then(handleSuccess(successMsg, redirectURL))
      .catch(miqService.handleFailure);
  }

  function handleErrors(response) {
    if (response.error) {
      // flash & sparkleOff handled by miqService.handleFailure
      return Promise.reject({
        message: __(response.error.klass) + ': ' + __(response.error.message),
      });
    }
  }

  function handleSuccess(message, url) {
    return function() {
      miqFlashLater({ message: message });
      $window.location.href = url;
    };
  }
}]);

