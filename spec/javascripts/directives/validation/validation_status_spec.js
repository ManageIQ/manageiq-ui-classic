describe('validationStatus initialization', function() {
  var $scope, $parentScope, form;
  beforeEach(module('ManageIQ'));
  beforeEach(inject(function($compile, $rootScope) {
    $scope = $rootScope.$new();
    $parentScope = $rootScope.$new();
    $scope.$parent = $parentScope;
    $parentScope.model = "emsCommonModel";
    var element = angular.element(
      '<form name="angularForm">' +
      '<input type="text" error-on-tab="default"/>' +
      '<input type="checkbox" main-scope="$parent" validation-status="" prefix="default" ng-model="emsCommonModel.default_auth_status" name="default_auth_status"/>' +
      '</form>'
    );
    $compile(element)($scope);
    $scope.$digest();
    elem = $compile(element)($rootScope);
    angularForm = $scope.angularForm;
  }));

  describe('validation-status', function() {
    it('builds post Validation Model when validation status is valid', function() {
      $parentScope.postValidationModelRegistry = function() {};
      spyOn($parentScope, 'postValidationModelRegistry');
      angularForm.default_auth_status.$setViewValue(true);
      expect($parentScope.postValidationModelRegistry).toHaveBeenCalled();
    });

    it('sets error icon on html element when validation status is invalid', inject(function($rootScope, $timeout) {
      angularForm.default_auth_status.$setViewValue(false);
      $timeout.flush();
      expect(elem[0][0].className).toEqual("fa fa-exclamation-circle");
    }));
  });
});
