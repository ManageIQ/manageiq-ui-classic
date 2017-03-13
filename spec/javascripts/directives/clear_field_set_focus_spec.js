describe('clearFieldSetFocus initialization', function() {
  var $scope, form, ctrl, hostScope, credScope;
  beforeEach(module('ManageIQ'));
  beforeEach(inject(function($compile, $rootScope, _miqService_, _$controller_) {
    hostScope = $rootScope.$new();
    credScope = hostScope.$new();
    $scope = credScope.$new();
    miqService = _miqService_;

    $scope.$parent.formId = '12345';
    ctrl = _$controller_('CredentialsController',
      {$scope: credScope, $attrs: {'vmScope': '$parent'}});

    var element = angular.element(
      '<form name="angularForm">' +
      '<ng-controller="CredentialsController as vm">' +
      '<input clear-field-set-focus type="text" ng-model="$parent.hostModel.password" name="password"/>' +
      '<input clear-field-set-focus="no-focus" type="text" ng-model="$parent.hostModel.password_verify" name="password_verify"/>' +
      '</form>'
    );
    elem = $compile(element)(credScope);
    form = $scope.angularForm;
    $scope.$parent.model = "hostModel";
    $scope.$parent.hostModel = {'password': '', 'password_verify': ''};
    $scope.$parent.hostModel.password = miqService.storedPasswordPlaceholder;
    $scope.$parent.hostModel.password_verify = miqService.storedPasswordPlaceholder;
    $scope.$parent.vm = ctrl;
  }));

  describe('clear-field-set-focus specs', function() {
    it('sets focus on the password field and clears out the placeholder', inject(function($timeout) {
      spyOn(elem[0][0], 'focus');
      ctrl.changeStoredPassword();
      $timeout.flush();
      expect($scope.$parent.hostModel.password).toBe('');
      expect((elem[0][0]).focus).toHaveBeenCalled();
    }));

    it('clears out the placeholder in the password verify field', inject(function($timeout) {
      spyOn(elem[0][1], 'focus');
      ctrl.bChangeStoredPassword = true;
      $timeout.flush();
      expect($scope.$parent.hostModel.password_verify).toBe('');
      expect((elem[0][1]).focus).not.toHaveBeenCalled();
    }));

    it('puts back the placeholder when cancel password change is selected', inject(function($timeout) {
      ctrl.bCancelPasswordChange = true;
      $timeout.flush();
      expect($scope.$parent.hostModel.password).toBe(miqService.storedPasswordPlaceholder);
      expect($scope.$parent.hostModel.password_verify).toBe(miqService.storedPasswordPlaceholder);
    }));
  });
});
