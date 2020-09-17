describe('datetimepicker test', function() {
  var scope, form, element, compile;
  beforeEach(module('ManageIQ'));
  beforeEach(inject(function($compile, $rootScope) {
    scope = $rootScope;
    compile = $compile;
    element = angular.element('<form name="angularForm">' +
      '<input type="text" datetimepicker="true" ng-model="testModel.test_date" name="test_date" ' +
      'start-date="testModel.start_date" datetime-format="MM/DD/YYYY HH:mm" ' +
      '/></form>');
    scope.testModel = {
      test_date : new Date(2015, 7, 30, 13, 45),
      start_date: new Date(Date.UTC(1970, 0, 1)),
    };
    compile(element)(scope);
    scope.$digest();
    form = scope.angularForm;
  }));

  describe('datetimepicker formatter and parser', function() {
    it('should format a date value from model into string value for output', function() {
      expect(form.test_date.$viewValue).toBe('08/30/2015 13:45');
    });

    it('should parse a value from input into model value', function() {
      form.test_date.$setViewValue('12/31/1980 15:22');
      expect(scope.testModel.test_date).toEqual(new Date(1980, 11, 31, 15, 22));
    });
  });
});
