import { module, inject } from './mocks';

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
