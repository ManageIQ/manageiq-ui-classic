/* global miqAjaxButton miqBuildCalendar miqButtons miqJqueryRequest miqRESTAjaxButton miqSparkleOff miqSparkleOn add_flash */

ManageIQ.angular.app.service('miqService', ['$timeout', '$document', '$q', function($timeout, $document, $q) {
  var miqService = this;

  this.storedPasswordPlaceholder = "●●●●●●●●";

  this.showButtons = function() {
    miqButtons('show');
  };

  this.hideButtons = function() {
    miqButtons('hide');
  };

  this.buildCalendar = function(year, month, date) {
    ManageIQ.calendar.calDateFrom = new Date(year, month, date);
    miqBuildCalendar(true);
  };

  this.miqAjaxButton = function(url, serializeFields, options) {
    miqAjaxButton(url, serializeFields, options);
  };

  this.miqAsyncAjaxButton = function(url, serializeFields) {
    miqJqueryRequest(url, {beforeSend: true, data: serializeFields});
  };

  this.restAjaxButton = function(url, button, dataType, data) {
    miqRESTAjaxButton(url, button, dataType, data);
  };

  this.jqueryRequest = function(url, options) {
    miqJqueryRequest(url, options);
  };

  this.sparkleOn = function() {
    miqSparkleOn();
  };

  this.sparkleOff = function() {
    miqSparkleOff();
  };

  this.miqFlash = function(type, msg) {
    miqService.miqFlashClear();
    add_flash(msg, type);
  };

  // FIXME: usually we just hide it, merge the logic
  this.miqFlashClear = function() {
    $('#flash_msg_div').text("");
  };

  this.saveable = function(form) {
    return form.$valid && form.$dirty;
  };

  this.dynamicAutoFocus = function(element) {
    $timeout(function() {
      var queryResult = $document[0].getElementById(element);
      if (queryResult) {
        queryResult.focus();
      }
    }, 200);
  };

  this.validateWithAjax = function (url) {
    miqSparkleOn();
    miqAjaxButton(url, true);
  };

  this.validateWithREST = function($event, credType, url, formSubmit) {
    angular.element('#button_name').val('validate');
    angular.element('#cred_type').val(credType);
    if(formSubmit) {
      miqSparkleOn();
      return miqRESTAjaxButton(url, $event.target, 'json');
    }
    else {
      $event.preventDefault();
    }
  };

  this.disabledClick = function($event) {
    $event.preventDefault();
  };

  this.serializeModel = function(model) {
    var serializedObj = angular.copy(model);

    for (var k in serializedObj) {
      if (serializedObj.hasOwnProperty(k) && !serializedObj[k]) {
        delete serializedObj[k];
      }
    }

    return serializedObj;
  };

  this.serializeModelWithIgnoredFields = function(model, ignoredFields) {
    var serializedObj = angular.copy(model);

    for (var k in serializedObj) {
      if ((ignoredFields.indexOf(k) >= 0) || (serializedObj.hasOwnProperty(k) && !serializedObj[k])) {
        delete serializedObj[k];
      }
    }

    return serializedObj;
  };

  this.handleFailure = function(e) {
    miqSparkleOff();

    if (e.error !== undefined && e.error.message !== undefined) {
      console.error(e.error.message);
      miqService.miqFlash('error', e.error.message);
    } else if (e.message) {
      console.error(e.message);
      miqService.miqFlash('error', e.message);
    }

    return $q.reject(e);
  };
}]);
