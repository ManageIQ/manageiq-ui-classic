describe('Ems edit cloud component', () => {
  let $scope;
  let element;
  //let vm;

  beforeEach(() => {
    module('ManageIQ');
  });

  beforeEach(inject(($compile, $rootScope, emsEditCloudFormBak) => {
    $scope = $rootScope;
    $scope.afterGet = true;
    element = $compile('<ems-edit-cloud-form test="test"></ems-edit-cloud-form>')($scope);
    $scope.$digest();
  }));

  it('should display name', () => {
    expect(element).toBeDefined();
    expect(element[0]).toMatchSnapshot();
  });
});
