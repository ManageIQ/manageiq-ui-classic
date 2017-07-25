/* global miqFlashLater */

ManageIQ.angular.app.service('postService', ['miqService', '$timeout', '$window', 'API', function(miqService, $timeout, $window, API) {
  this.saveRecord = function(apiURL, redirectURL, updateObject, successMsg, action) {
    miqService.sparkleOn();
    return API.post(apiURL,
      angular.toJson({
        action: action,
        resource: updateObject
      })).then(handleSuccess)
         .catch(miqService.handleFailure);

    function handleSuccess(response) {
      postSuccess(response, successMsg, redirectURL);
    }
  };

  this.createRecord = function(apiURL, redirectURL, createObject, successMsg) {
    miqService.sparkleOn();
    return API.post(apiURL,
      angular.toJson({
        action: "create",
        resource: createObject
      })).then(handleSuccess)
         .catch(miqService.handleFailure);

    function handleSuccess(response) {
      postSuccess(response, successMsg, redirectURL);
    }
  };

  this.cancelOperation = function(redirectURL, msg) {
    $timeout(function () {
      miqFlashLater({ message: msg });
      $window.location.href = redirectURL;
    });
  };

  function postSuccess(response, successMsg, redirectURL) {
    $timeout(function () {
      if (response.error) {
        var msg = __(response.error.klass + ': ' + response.error.message);
        miqService.miqFlash('error', msg);
        miqService.sparkleOff();
      } else {
        miqFlashLater({ message: successMsg });
        $window.location.href = redirectURL;
      }
    });
  }
}]);

