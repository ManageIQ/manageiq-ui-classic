describe('emsKeypairController', function() {
  var $scope, $controller, $httpBackend, miqService;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function($rootScope, _$controller_) {
    $scope = $rootScope.$new();
    $scope.model = "emsCommonModel";
    $controller = _$controller_('emsKeypairController', {$scope: $scope});
    $controller.initialize({'ssh_keypair_userid': 'abc', 'ssh_keypair_pasword': '********'}, '12345');
  }));

  describe('when formId is new', function() {
    beforeEach(inject(function($rootScope, _$controller_) {
      $controller = _$controller_('emsKeypairController', {$scope: $scope});
      $controller.initialize("emsCommonModel", "new")
    }));
    it('initializes stored password state flags for new records', function() {
      expect($controller.newRecord).toBeTruthy();
      expect($controller.changeKey).toBeUndefined();
    });
  });

  describe('when formId is not new', function() {
    beforeEach(inject(function($rootScope, _$controller_) {
      $controller = _$controller_('emsKeypairController', {$scope: $scope});
      $controller.initialize("emsCommonModel", "12345")
    }));
    it('initializes stored password state flags for existing records', function() {
      expect($controller.newRecord).toBeFalsy();
      expect($controller.changeKey).toBeFalsy();
    });
  });

  it('sets proper values when Change Stored PrivateKey is clicked', function() {
    $controller.changeStoredPrivateKey();
    expect($controller.changeKey).toBeTruthy();
  });

  it('sets proper values when cancel private key change is clicked', function() {
    $controller.changeStoredPrivateKey();
    $controller.cancelPrivateKeyChange();
    expect($controller.changeKey).toBeFalsy();
  });

  it('shows private key change links when record is not new and userid exists', function() {
    $controller.initialize({'ssh_keypair_userid': 'abc', 'ssh_keypair_pasword': '********'}, '12345');
    expect($controller.showChangePrivateKeyLinks('ssh_keypair_userid')).toBeTruthy();
  });

  it('does not show private key change links when record is not new and userid does not exist', function() {
    $controller.initialize({'ssh_keypair_userid': '', 'ssh_keypair_pasword': ''}, '12345');
    expect($controller.showChangePrivateKeyLinks('ssh_keypair_userid')).toBeFalsy();
  });

  it('does not show private key change links when record is not new, userid did not exist before but is now filled in by the user', function() {
    $controller.initialize({'ssh_keypair_userid': '', 'ssh_keypair_pasword': ''}, '12345');
    $controller.model.ssh_keypair_userid = 'xyz';
    expect($controller.showChangePrivateKeyLinks('ssh_keypair_userid')).toBeFalsy();
  });

  it('restores the flag values to original state when reset is clicked after change stored private key link was clicked', function() {
    $controller.changeStoredPrivateKey();
    $controller.resetClicked();
    expect($controller.changeKey).toBeFalsy();
  });

  it('restores the flag values to original state when reset is clicked before change stored private key link was clicked', function() {
    $controller.resetClicked();
    expect($controller.changeKey).toBeFalsy();
  });

  describe('#showValidate', function() {
    var combinations = [
      { emstype: 'openstack', newRecord: true, tab: 'ssh_keypair', value: false },
      { emstype: 'openstack', newRecord: true, tab: 'other_tab', value: true },
      { emstype: 'openstack', newRecord: false, tab: 'tab', value: true },

      { emstype: 'openstack_infra', newRecord: true, tab: 'ssh_keypair', value: false },
      { emstype: 'openstack_infra', newRecord: true, tab: 'other_tab', value: true },
      { emstype: 'openstack_infra', newRecord: false, tab: 'tab', value: true },

      { emstype: 'other_emstype', newRecord: true, tab: 'tab', value: true },
      { emstype: 'other_emstype', newRecord: false, tab: 'tab', value: true },

      { emstype: 'rhevm', newRecord: false, tab: 'ssh_keypair', value: false },
      { emstype: 'rhevm', newRecord: false, tab: 'other_tab', value: true },
      { emstype: 'rhevm', newRecord: true, tab: 'ssh_keypair', value: false },
      { emstype: 'rhevm', newRecord: true, tab: 'other_tab', value: true },
    ];

    combinations.forEach(function(options) {
      context('with emsCommonModel ' + options.emstype, function() {
        beforeEach(inject(function($rootScope, _$controller_) {
          $controller = _$controller_('emsKeypairController', { $scope: $scope });
          $controller.initialize({ emstype: options.emstype }, "12345");
        }));

        context('with newRecord ' + options.newRecord, function() {
          context('with tab ' + options.tab, function() {
            it('showValidate should be ' + options.value ? 'truthy' : 'falsy', function() {
              $controller.newRecord = options.newRecord;
              var method = options.value ? 'toBeTruthy' : 'toBeFalsy';
              expect($controller.showValidate(options.tab))[method]();
            });
          });
        });
      });
    });
  });
});
