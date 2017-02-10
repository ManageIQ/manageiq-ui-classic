describe('minTimeCheck initialization', function() {
  var $scope, form, angularForm;
  beforeEach(module('ManageIQ'));
  beforeEach(inject(function($compile, $rootScope) {
    $scope = $rootScope;
    $scope.vm = {};
    $scope.vm.timeProfileModel = {};
    $scope.vm.timeProfileModel.dayValues = _.times(7, _.constant(false));
    var element = angular.element(
      '<form name="angularForm">' +
      '<input type="checkbox" name="dayValue" ng-model="vm.timeProfileModel.dayValues[0]" time-type="day" min-time-check="0"/>' +
      '</form>'
    );
    $compile(element)($scope);
    $scope.$digest();
    angularForm = $scope.angularForm;
  }));

  describe('minTimeCheck', function() {
    it('sets timeProfileModel.some_days_checked to false if a given day in a week checkbox is false', function() {
      angularForm.dayValue.$setViewValue(false);
      expect($scope.vm.timeProfileModel.some_days_checked).toBeFalsy();
    });

    it('sets timeProfileModel.some_days_checked to true if a given day in a week checkbox is true', function() {
      angularForm.dayValue.$setViewValue(true);
      expect($scope.vm.timeProfileModel.some_days_checked).toBeTruthy();
    });
  });
});
