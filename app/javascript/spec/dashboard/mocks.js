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

// FIXME: app/javascript/oldjs/services/
ManageIQ.angular.app.service('miqService', function handleFailure() {
  this.handleFailure = () => null;
});

// FIXME: app/javascript/oldjs/miq_application.js
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

require('../../angular/dashboard');

export { module, inject };
