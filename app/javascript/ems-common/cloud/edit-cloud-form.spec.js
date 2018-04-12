require('angular-mocks');


describe('Ems edit cloud component', () => {
  let $scope;
  let element;

  beforeEach(() => {
    angular.module('ManageIQ');
  });

  beforeEach(inject(($compile, $rootScope) => {
    $scope = $rootScope;
    $scope.afterGet = true;
    element = $compile('<ems-edit-cloud-form test="test"></ems-edit-cloud-form>')($scope);
    $scope.$digest();
  }));

  it('should display name', () => {
    console.log('element: ', element.find('form'));
    expect(element).toBeDefined();
    expect(element).toMatchSnapshot();
  });
});
