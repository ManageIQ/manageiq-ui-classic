describe('validationStatus initialization', function() {
  var $scope;
  var elem;
  var angularForm;
  beforeEach(module('ManageIQ'));
  beforeEach(inject(function($compile, $rootScope) {
    $scope = $rootScope.$new();
    $scope.postValidationModelRegistry = jasmine.createSpy('postValidationModelRegistry');
    var element = angular.element(
      '<form name="angularForm">' +
      '<input type="text" error-on-tab="default"/>' +
      '<input type="checkbox" validation-status="" prefix="default"' +
        'ng-model="emsCommonModel.default_auth_status"' +
        'name="default_auth_status"' +
        'post-validation-model-registry="postValidationModelRegistry"/>' +
      '</form>'
    );
    elem = $compile(element)($scope);
    elem.scope().$digest();
    angularForm = $scope.angularForm;
  }));

  describe('validation-status', function() {
    it('builds post Validation Model when validation status is valid', function() {
      angularForm.default_auth_status.$setViewValue(true);
      expect($scope.postValidationModelRegistry).toHaveBeenCalled();
    });

    it('sets error icon on html element when validation status is invalid', inject(function($timeout) {
      angularForm.default_auth_status.$setViewValue(false);
      $timeout.flush();
      expect(elem[0][0].className).toEqual('fa fa-exclamation-circle');
    }));
  });
});
