import { module, inject } from './mocks';

describe('widget-wrapper', () => {
  let $scope;
  let element;
  let $compile;
  const widgetTypes = ['chart', 'menu', 'report', 'rss'];

  beforeEach(module('ManageIQ'));

  beforeEach(inject((_$compile_, $rootScope, $templateCache, $http) => {
    // FIXME: templateRequest is using $http to get the template, but angular-mocks prevents it
    $templateCache.put('/static/dropdown-menu.html.haml', '<div></div>');

    $scope = $rootScope;

    $compile = _$compile_;
    spyOn($http, 'get').and.callFake((url) => {
      if (url === '/static/dropdown-menu.html.haml') {
        return Promise.resolve({
          data: '<div></div>',
          status: 200,
          statusText: 'OK',
        });
      }
      return Promise.resolve({
        data: {
          content: '<div></div>',
          minimized: false,
          shortcuts: [],
        },
        status: 200,
        statusText: 'OK',
      });
    });
  }));

  widgetTypes.forEach((widget) => {
    it(`renders widget-${widget} when widget-type is ${widget}`, (done) => {
      element = angular.element(`
        <form name="angularForm">
          <widget-wrapper widget-id="42" widget-blank="false" widget-buttons="null" widget-type="${widget}"></widget-wrapper>
        </form>
      `);
      element = $compile(element)($scope);
      $scope.$digest();

      const $ctrl = element.find('widget-wrapper').find('div').scope().vm;
      $ctrl.promise.catch(() => null).then(() => {
        $scope.$digest();

        const widgetElement = element.find('widget-'.concat(widget));
        expect(widgetElement).toHaveLength(1);
        done();
      });
    });
  });
});
