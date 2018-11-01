import { module, inject } from './mocks';

describe('widget-empty', () => {
  let $scope;
  let element;
  let $compile;

  beforeEach(module('ManageIQ'));
  beforeEach(inject((_$compile_, $rootScope, $templateCache) => {
    // FIXME: templateRequest is using $http to get the template, but angular-mocks prevents it
    $templateCache.put('/static/dropdown-menu.html.haml', '<div></div>');
    $scope = $rootScope;
    $scope.miqButtonClicked = () => null;
    $scope.validForm = true;
    $compile = _$compile_;
  }));

  it('is rendered in widget-wrapper if widget-blank is set to true', (done) => {
    element = angular.element(`
      <form name="angularForm">
        <widget-wrapper widget-id="42" widget-blank="true" widget-buttons="null"></widget-wrapper>
      </form>
    `);
    element = $compile(element)($scope);

    $scope.$digest();

    setTimeout(() => {
      const widget = element.find('widget-empty');
      expect(widget).toHaveLength(1);

      done();
    });
  });
});
