require('angular');
require('angular-mocks');
const module = window.module;
const inject = window.inject;

window.ManageIQ = {
  angular: {
    app: angular.module('ManageIQ', []),
  },
};
window.__ = (x) => x;

// FIXME: app/assets/javascripts/services/
ManageIQ.angular.app.service('miqService', function () {
  this.handleFailure = () => null;
});

// FIXME: miq_application.js
window.miqDeferred = () => {
  var deferred = {};

  deferred.promise = new Promise(function (resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
};

// FIXME: don't mock PF functions
$.fn.setupVerticalNavigation = function() {};

require('../../../assets/javascripts/components/widget-chart');
require('../../../assets/javascripts/components/widget-empty');
require('../../../assets/javascripts/components/widget-error');
require('../../../assets/javascripts/components/widget-footer');
require('../../../assets/javascripts/components/widget-menu');
require('../../../assets/javascripts/components/widget-report');
require('../../../assets/javascripts/components/widget-rss');
require('../../../assets/javascripts/components/widget-spinner');
require('../../../assets/javascripts/components/widget-wrapper');

export { module, inject };
