describe('hostnameValidation initialization', function() {
  var $scope;

  beforeEach(module('ManageIQ'));
  beforeEach(inject(function($compile, $rootScope) {
    $scope = $rootScope;
    $scope.model = "hostModel";
    var element = angular.element(
      '<form name="angularForm">' +
      '<input type="text" ng-trim=false hostname_validation ng-model="emsCommonModel.hostname" name="hostname"/>' +
      '</form>'
    );
    $compile(element)($scope);
    $scope.$digest();
    angularForm = $scope.angularForm;
  }));

  describe('hostname invalid', function() {
    it('sets the form to invalid if hostname has protocol', function() {
      angularForm.hostname.$setViewValue('http://localhost');
      expect(angularForm.hostname.$error.hostnameValidation).toBeDefined();
      expect(angularForm.hostname.$valid).toBeFalsy();
      expect(angularForm.$invalid).toBeTruthy();
    });

    it('sets the form to invalid if hostname has path', function() {
      angularForm.hostname.$setViewValue('localhost/path');
      expect(angularForm.hostname.$error.hostnameValidation).toBeDefined();
      expect(angularForm.hostname.$valid).toBeFalsy();
      expect(angularForm.$invalid).toBeTruthy();
    });

    it('sets the form to invalid if hostname has port', function() {
      angularForm.hostname.$setViewValue('localhost:4321');
      expect(angularForm.hostname.$error.hostnameValidation).toBeDefined();
      expect(angularForm.hostname.$valid).toBeFalsy();
      expect(angularForm.$invalid).toBeTruthy();
    });
  });

  describe('hostname valid', function() {
    it('sets the form to valid if hostname has domain name', function() {
      angularForm.hostname.$setViewValue('domain.name');
      expect(angularForm.hostname.$error.hostnameValidation).not.toBeDefined();
      expect(angularForm.hostname.$valid).toBeTruthy();
      expect(angularForm.$invalid).toBeFalsy();
    });

    it('sets the form to valid if hostname has ipv4', function() {
      angularForm.hostname.$setViewValue('10.10.10.10');
      expect(angularForm.hostname.$error.hostnameValidation).not.toBeDefined();
      expect(angularForm.hostname.$valid).toBeTruthy();
      expect(angularForm.$invalid).toBeFalsy();
    });

    it('sets the form to valid if hostname has ipv6', function() {
      angularForm.hostname.$setViewValue('2001:cdba:0000:0000:0000:0000:3257:9652');
      expect(angularForm.hostname.$error.hostnameValidation).not.toBeDefined();
      expect(angularForm.hostname.$valid).toBeTruthy();
      expect(angularForm.$invalid).toBeFalsy();
    });
  });
});
