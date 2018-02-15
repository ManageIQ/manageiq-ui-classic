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
ManageIQ.angular.app.service('miqService', function() {
  this.handleFailure = () => null;
});

// FIXME: miq_application.js
window.miqDeferred = () => {
  var deferred = {};

  deferred.promise = new Promise(function(resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
};

require('../../../assets/javascripts/components/widget-chart');
require('../../../assets/javascripts/components/widget-empty');
require('../../../assets/javascripts/components/widget-error');
require('../../../assets/javascripts/components/widget-footer');
require('../../../assets/javascripts/components/widget-menu');
require('../../../assets/javascripts/components/widget-report');
require('../../../assets/javascripts/components/widget-rss');
require('../../../assets/javascripts/components/widget-spinner');
require('../../../assets/javascripts/components/widget-wrapper');


describe('widget-empty', function() {
  var $scope, element, $compile;

  beforeEach(module('ManageIQ'));
  beforeEach(inject(function(_$compile_, $rootScope, $templateCache) {
    // FIXME: templateRequest is using $http to get the template, but angular-mocks prevents it
    $templateCache.put('/static/dropdown-menu.html.haml', '<div></div>');
    $scope = $rootScope;
    $scope.miqButtonClicked = function() {};
    $scope.validForm = true;
    $compile = _$compile_;
  }));

  it('is rendered in widget-wrapper if widget-blank is set to true', function(done) {
    element = angular.element(
      '<form name="angularForm">' +
      '<widget-wrapper widget-id="42" widget-blank=true widget-buttons="null"></widget-wrapper>' +
      '</form>'
    );
    element = $compile(element)($scope);

    $scope.$digest();

    setTimeout(function() {
      var widget = element.find("widget-empty");
      expect(widget.length).toBe(1);

      done();
    });
  });
}
);
