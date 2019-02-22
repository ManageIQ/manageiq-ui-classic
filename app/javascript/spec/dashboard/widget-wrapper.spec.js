import { module, inject } from './mocks';

require('../helpers/getJSONFixtures.js');

describe('widget-wrapper', () => {
  let $scope;
  let element;
  let $compile;
  const widgetTypes = ['chart', 'menu', 'report'];

  beforeEach(module('ManageIQ'));

  beforeEach(inject((_$compile_, $rootScope, $http) => {
    $scope = $rootScope;

    $compile = _$compile_;

    const response = {
      data: {
        content: '<div></div>',
        minimized: false,
        shortcuts: [],
      },
      status: 200,
      statusText: 'OK',
    };
    spyOn($http, 'get').and.callFake(() => Promise.resolve(response));
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
