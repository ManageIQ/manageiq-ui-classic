require('angular');
// no need for devDependencies rule, this is purely tests helper file
require('angular-mocks'); // eslint-disable-line import/no-extraneous-dependencies

const { module, inject } = window;

window.ManageIQ = {
  angular: {
    app: angular.module('ManageIQ', []),
  },
};
window.__ = x => x;

// FIXME: app/assets/javascripts/services/
ManageIQ.angular.app.service('miqService', function handleFailure() {
  this.handleFailure = () => null;
});

// FIXME: miq_application.js
window.miqDeferred = () => {
  const deferred = {};

  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
};

// FIXME: don't mock PF functions
$.fn.setupVerticalNavigation = () => {};

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
