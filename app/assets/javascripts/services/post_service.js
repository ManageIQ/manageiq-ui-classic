ManageIQ.angular.app.service('postService', ["miqService", "$timeout", "$window", function(miqService, $timeout, $window) {

  this.saveRecord = function(apiURL, redirectURL, updateObject, successMsg) {
    miqService.sparkleOn();
    return API.post(apiURL,
      angular.toJson({
        action: "edit",
        resource: updateObject
      })).then(handleSuccess)
         .catch(miqService.handleFailure);

    function handleSuccess(response) {
      $timeout(function () {
        if (response.error) {
          var msg = __(response.error.klass + ': ' + response.error.message);
          miqService.miqFlash('error', msg);
          miqService.sparkleOff();
        } else {
          $window.location.href = redirectURL + '&flash_msg=' + successMsg;
        }
      });
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
      $timeout(function () {
        if (response.error) {
          var msg = __(response.error.klass + ': ' + response.error.message);
          miqService.miqFlash('error', msg);
          miqService.sparkleOff();
        } else {
          $window.location.href = redirectURL + '&flash_msg=' + successMsg;
        }
      });
    }
  };

  this.cancelOperation = function(redirectURL, msg) {
    $timeout(function () {
      $window.location.href = redirectURL + '&flash_msg=' + msg;
    });
  };
}]);

