/* global miqAjaxButton miqBuildCalendar miqButtons miqJqueryRequest miqRESTAjaxButton miqSparkleOff miqSparkleOn add_flash miqFlashLater miqFlashSaved */

ManageIQ.angular.app.service('miqService', ['$q', 'API', '$window', function($q, API, $window) {
  var miqService = this;

  this.storedPasswordPlaceholder = '●●●●●●●●';
  this.deploymentExists = 'EXISTS';

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

  this.refreshSelectpicker = function() {
    $('select').selectpicker('refresh');
  };

  this.sparkleOn = function() {
    miqSparkleOn();
  };

  this.sparkleOff = function() {
    miqSparkleOff();
  };

  this.miqFlash = function(type, msg, options) {
    miqService.miqFlashClear();
    add_flash(msg, type, options);
  };

  // FIXME: usually we just hide it, merge the logic
  this.miqFlashClear = function() {
    $('#flash_msg_div').text('');
  };

  this.miqFlashLater = function(msgObj) {
    miqFlashLater(msgObj);
  };

  this.miqFlashSaved = function() {
    miqFlashSaved();
  };

  this.saveable = function(form) {
    return form.$valid && form.$dirty;
  };

  this.networkProviders = function(options) {
    options = Object.assign(options || {}, {
      attributes: ['id', 'name'],
      handleFailure: miqService.handleFailure,
    });
    var url = '/api/providers?collection_class=ManageIQ::Providers::NetworkManager&expand=resources';

    if (options.attributes) {
      url += '&attributes=' + options.attributes.map(encodeURIComponent).join(',');
    }

    if (options.filter_security_group_creation) {
      url += '&filter[]=supports_create_security_group=true';
    }

    return API.get(url)
      .then(function(response) {
        return response.resources || [];
      })
      .catch(options.handleFailure);
  };

  this.handleFailure = function(e) {
    miqSparkleOff();

    var message = __('Unknown error');
    if (e.data && e.data.error && e.data.error.message) {
      message = e.data.error.message;
    } else if (e.error && e.error.message) {
      message = e.error.message;
    } else if (e.message) {
      message = e.message;
    }

    console.error(message);
    miqService.miqFlash('error', message);

    return $q.reject(e);
  };

  this.redirectBack = function(message, flashType, redirectUrl) {
    miqFlashLater({message: message, level: flashType});

    $window.location.href = redirectUrl;
  };
}]);
