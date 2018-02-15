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


describe('widget-wrapper', function() {
  var $scope, element, $compile;
  var widgetTypes = ['chart', 'menu', 'report', 'rss'];

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(_$compile_, $rootScope, $templateCache, $http) {
    // FIXME: templateRequest is using $http to get the template, but angular-mocks prevents it
    $templateCache.put('/static/dropdown-menu.html.haml', '<div></div>');

    $scope = $rootScope;

    $compile = _$compile_;
    spyOn($http, 'get').and.callFake(function(url) {
      if (url === '/static/dropdown-menu.html.haml') {
        return Promise.resolve({
          data: "<div></div>",
          status: 200,
          statusText: 'OK',
        });
      } else {
        return Promise.resolve({
          data: {
            content: "<div></div>",
            minimized: false,
            shortcuts: [],
          },
          status: 200,
          statusText: 'OK',
        });
      }
    });
  }));

  widgetTypes.forEach(function (widget) {
    it('renders widget-' + widget +  ' when widget-type is ' + widget, function(done) {
      element = angular.element(
        '<form name="angularForm">' +
        '  <widget-wrapper widget-id="42" widget-blank=false widget-buttons="null" widget-type="' + widget + '"></widget-wrapper>' +
        '</form>'
      );
      element = $compile(element)($scope);
      $scope.$digest();

      var $ctrl = element.find('widget-wrapper').find('div').scope().vm;
      $ctrl.promise.catch(function () {}).then(function(){
        $scope.$digest();

        var widgetElement = element.find("widget-" + widget);
        expect(widgetElement.length).toBe(1);
        done();
      });
    });
  });
});
