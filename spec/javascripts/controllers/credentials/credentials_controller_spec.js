describe('CredentialsController', function() {
  var $scope, vm, $httpBackend;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(_$httpBackend_, $rootScope, _$controller_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    $scope.model = "hostModel";
    vm = _$controller_('CredentialsController',
      {$http: $httpBackend,
       $scope: $scope,
       $attrs: {'vmScope': '$parent'}});
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('when formId is new', function() {
    beforeEach(inject(function(_$httpBackend_, $rootScope, _$controller_) {
      $scope.$parent.formId = 'new';
      vm = _$controller_('CredentialsController',
        {$http: $httpBackend,
         $scope: $scope,
         $attrs: {'vmScope': '$parent'}});
    }));
    it('initializes stored password state flags for new records', function() {
      expect(vm.newRecord).toBeTruthy();
      expect(vm.bChangeStoredPassword).toBeUndefined();
      expect(vm.bCancelPasswordChange).toBeUndefined();
    });
  });

  describe('when formId is not new', function() {
    beforeEach(inject(function(_$httpBackend_, $rootScope, _$controller_) {
      $scope.$parent.formId = '12345';
      vm = _$controller_('CredentialsController',
        {$http: $httpBackend, $scope: $scope, $attrs: {'vmScope': '$parent'}});
    }));
    it('initializes stored password state flags for existing records', function() {
      expect(vm.newRecord).toBeFalsy();
      expect(vm.bChangeStoredPassword).toBeFalsy();
      expect(vm.bCancelPasswordChange).toBeFalsy();
    });
  });

  it('sets proper values when Change Stored Password is clicked', function() {
    vm.changeStoredPassword();
    expect(vm.bChangeStoredPassword).toBeTruthy();
    expect(vm.bCancelPasswordChange).toBeFalsy();
  });

  it('sets proper values when Cancel Password change is clicked', function() {
    vm.changeStoredPassword();
    vm.cancelPasswordChange();
    expect(vm.bChangeStoredPassword).toBeFalsy();
    expect(vm.bCancelPasswordChange).toBeTruthy();
  });

  it('shows Verify Password field when record is new', function() {
    vm.newRecord = true;
    $scope.$parent.hostModel = {'default_userid': '', 'default_password': '', 'default_verify': ''};
    $scope.$parent.modelCopy = angular.copy( $scope.$parent.hostModel );
    expect(vm.showVerify('default_userid')).toBeTruthy();
  });

  it('shows Verify Password field only after Change Stored Password is clicked', function() {
    $scope.$parent.hostModel = {'default_userid': 'abc', 'default_password': '********', 'default_verify': '********'};
    $scope.$parent.modelCopy = angular.copy( $scope.$parent.hostModel );
    expect(vm.showVerify('default_userid')).toBeFalsy();
    vm.changeStoredPassword();
    expect(vm.showVerify('default_userid')).toBeTruthy();
  });

  it('shows Verify Password field when record is not new, userid does not exist', function() {
    vm.newRecord = false;
    $scope.$parent.hostModel = {'default_userid': '', 'default_password': '', 'default_verify': ''};
    $scope.$parent.modelCopy = angular.copy( $scope.$parent.hostModel );
    expect(vm.showVerify('default_userid')).toBeTruthy();
  });

  it('shows password change links when record is not new and userid exists', function() {
    vm.newRecord = false;
    $scope.$parent.hostModel = {'default_userid': 'abc', 'default_password': '********', 'default_verify': '********'};
    $scope.$parent.modelCopy = angular.copy( $scope.$parent.hostModel );
    expect(vm.showChangePasswordLinks('default_userid')).toBeTruthy();
  });

  it('does not show password change links when record is not new and userid does not exist', function() {
    vm.newRecord = false;
    $scope.$parent.hostModel = {'default_userid': '', 'default_password': '', 'default_verify': ''};
    $scope.$parent.modelCopy = angular.copy( $scope.$parent.hostModel );
    expect(vm.showChangePasswordLinks('default_userid')).toBeFalsy();
  });

  it('does not show password change links when record is not new, userid did not exist before but is now filled in by the user', function() {
    vm.newRecord = false;
    $scope.$parent.hostModel = {'default_userid': '', 'default_password': '', 'default_verify': ''};
    $scope.$parent.modelCopy = angular.copy( $scope.$parent.hostModel );
    $scope.$parent.hostModel.default_userid = 'xyz';
    expect(vm.showChangePasswordLinks('default_userid')).toBeFalsy();
  });

  it('restores the flag values to original state when reset is clicked after Change stored password link was clicked', function() {
    vm.changeStoredPassword();
    vm.resetClicked();
    expect(vm.bCancelPasswordChange).toBeTruthy();
    expect(vm.bChangeStoredPassword).toBeFalsy();
  });

  it('restores the flag values to original state when reset is clicked before Change stored password link was clicked', function() {
    vm.resetClicked();
    expect(vm.bCancelPasswordChange).toBeFalsy();
    expect(vm.bChangeStoredPassword).toBeFalsy();
  });
});
