ManageIQ.angular.app.service('postService', ["miqService", "$timeout", "$window", function(miqService, $timeout, $window) {

  this.saveRecord = function(apiURL, redirectURL, updateObject, successMsg) {
    miqService.sparkleOn();
    return API.post(apiURL,
      angular.toJson({
        action: "edit",
        resource: updateObject
      })).then(function(response) {
        if (response.error) {
          handleFailure(response);
        } else {
          handleSuccess;
        }
      });

    function handleSuccess() {
      $timeout(function () {
        $window.location.href = redirectURL + '&flash_msg=' + successMsg;
      });
    }

    function handleFailure(response) {
      var msg = sprintf(__('Error during Save: [%s - %s]'), response.error.klass, response.error.message);
      $timeout(function() {
        miqService.sparkleOff();
        miqService.miqFlash('error', __(msg));
      });
    }
  };

  this.createRecord = function(apiURL, redirectURL, createObject, successMsg) {
    miqService.sparkleOn();
    return API.post(apiURL,
      angular.toJson({
        action: "create",
        resource: createObject
      })).then(function(response) {
        if (response.error) {
          handleFailure(response);
        } else {
          handleSuccess;
        }
      });

    function handleSuccess() {
      $timeout(function () {
        $window.location.href = redirectURL + '&flash_msg=' + successMsg;
      });
    }

    function handleFailure(response) {
      var msg = sprintf(__('Error during Add: [%s - %s]'), response.error.klass, response.error.message);
      $timeout(function() {
        miqService.sparkleOff();
        miqService.miqFlash('error', __(msg));
      });
    }
  };

  this.cancelOperation = function(redirectURL, msg) {
    $timeout(function () {
      $window.location.href = redirectURL + '&flash_msg=' + msg;
    });
  };
}]);

