import { module, inject } from './mocks';
require('../helpers/API.js');

require('../helpers/getJSONFixtures.js');

describe('widget-empty', () => {
  let $scope;
  let element;
  let $compile;

  beforeEach(() => {
    module('ManageIQ');
    angular.mock.module('miq.api');
  });

  beforeEach(inject((_$compile_, $rootScope, $http) => {
    $scope = $rootScope;
    $scope.miqButtonClicked = () => null;
    $scope.validForm = true;
    $compile = _$compile_;
    const response = {
      data: {
        content: '',
        minimized: false,
        blank: 'true',
      },
      status: 200,
      statusText: 'OK',
    };
    spyOn($http, 'get').and.callFake(() => Promise.resolve(response));
    spyOn(window.vanillaJsAPI, 'post').and.returnValue(Promise.resolve({
      results: [
        { success: true, message: 'some' },
      ],
    }));
  }));

  it('is rendered in widget-wrapper if blank is set to true', (done) => {
    element = angular.element(`
      <form name="angularForm">
        <widget-wrapper widget-id="42" widget-buttons="null" widget-type="report"></widget-wrapper>
      </form>
    `);
    element = $compile(element)($scope);
    $scope.$digest();

    const $ctrl = element.find('widget-wrapper').find('div').scope().vm;
    $ctrl.promise.catch(() => null).then(() => {
      $scope.$digest();

      const widget = element.find('widget-empty');
      expect(widget).toHaveLength(1);
      done();
    });
  });
});
