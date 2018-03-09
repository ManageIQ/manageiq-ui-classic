// Configure the testing environment before each test.
// This code runs *before* the test framework is installed in the environment.

require('jquery');
require('lodash');
require('rxjs');
require('angular');

window.ManageIQ = {
  angular: {
    app: angular.module('ManageIQ', ['ngRedux'])
  }
};

window.__ = (x) => x;
window.n__ = (x) => x;
