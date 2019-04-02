describe('configurationManagerFormController', function() {
  var $scope, $httpBackend, miqService, vm;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(_$httpBackend_, $rootScope, _$controller_, _miqService_) {
    miqService = _miqService_;

    spyOn(miqService, 'showButtons');
    spyOn(miqService, 'hideButtons');
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');

    $scope = $rootScope.$new();

    var automationManagerFormResponse = {
      name: '',
      url: '',
      zone: 'foo_zone',
      verify_ssl: 0,
      default_userid: '',
    };

    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET('/automation_manager/form_fields/new').respond(automationManagerFormResponse);

    vm = _$controller_('configurationManagerFormController as vm', {
      $scope: $scope,
      configurationManagerFormId: 'new',
      miqService: miqService,
      modelName: 'configurationManagerModel',
      url: '/automation_manager',
    });

    $httpBackend.flush();
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('initialization', function() {
    describe('when the configurationManagerFormId is new', function() {
      it('sets the name to blank', function() {
        expect(vm.configurationManagerModel.name).toEqual('');
      });

      it('sets the zone to blank', function() {
        expect(vm.configurationManagerModel.zone).toEqual('foo_zone');
      });

      it('sets the url to blank', function() {
        expect(vm.configurationManagerModel.url).toEqual('');
      });

      it('sets the verify_ssl to blank', function() {
        expect(vm.configurationManagerModel.verify_ssl).toBeFalsy();
      });

      it('sets the default_userid to blank', function() {
        expect(vm.configurationManagerModel.default_userid).toEqual('');
      });

      it('sets the default_password to blank', function() {
        expect(vm.configurationManagerModel.default_password).toEqual('');
      });
    });

    describe('when the configurationManagerFormId is an Id', function() {
      var automationManagerFormResponse = {
        name: 'Ansible',
        url: '10.10.10.10',
        zone: 'My Test Zone',
        verify_ssl: 1,
        default_userid: 'admin',
      };

      beforeEach(inject(function(_$controller_) {
        $httpBackend.whenGET('/automation_manager/form_fields/12345').respond(automationManagerFormResponse);

        vm = _$controller_('configurationManagerFormController as vm', {
          $scope: $scope,
          configurationManagerFormId: '12345',
          miqService: miqService,
          modelName: 'configurationManagerModel',
          url: '/automation_manager',
        });

        $httpBackend.flush();
      }));

      it('sets the name to the value returned from http request', function() {
        expect(vm.configurationManagerModel.name).toEqual('Ansible');
      });

      it('sets the zone to the value returned from the http request', function() {
        expect(vm.configurationManagerModel.zone).toEqual('My Test Zone');
      });

      it('sets the url to the value returned from http request', function() {
        expect(vm.configurationManagerModel.url).toEqual('10.10.10.10');
      });

      it('sets the verify_ssl to the value returned from http request', function() {
        expect(vm.configurationManagerModel.verify_ssl).toBeTruthy();
      });

      it('sets the default_userid to the value returned from http request', function() {
        expect(vm.configurationManagerModel.default_userid).toEqual('admin');
      });

      it('sets the default_password to the value returned from http request', function() {
        expect(vm.configurationManagerModel.default_password).toEqual(miqService.storedPasswordPlaceholder);
      });
    });
  });

  describe('#resetClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function(value) {},
        $setUntouched: function(value) {},
      };

      vm.resetClicked();
    });

    it('does not turn the spinner on', function() {
      expect(miqService.sparkleOn.calls.count()).toBe(1); // init
    });
  });

  describe('#saveClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function(value) {},
      };

      vm.saveClicked();
    });

    it('turns the spinner on once', function() {
      expect(miqService.sparkleOn.calls.count()).toBe(2); // init and save
    });

    it('delegates to miqService.miqAjaxButton', function() {
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/automation_manager/edit/new?button=save', true);
    });
  });

  describe('#addClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function(value) {},
      };

      vm.addClicked();
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn.calls.count()).toBe(2); // init and add
    });

    it('delegates to miqService.miqAjaxButton', function() {
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/automation_manager/edit/new?button=save', true);
    });
  });

  describe('Validates credential fields', function() {
    beforeEach(inject(function($compile, miqService) {
      var angularForm;
      var element = angular.element(
        '<form name="angularForm">' +
        '<input ng-model="configurationManagerModel.url" name="url" required />' +
        '<input ng-model="configurationManagerModel.default_userid" name="default_userid" required />' +
        '<input ng-model="configurationManagerModel.default_password" name="default_password" required />' +
        '</form>'
      );

      $compile(element)($scope);
      $scope.$digest();
      angularForm = $scope.angularForm;

      $scope.angularForm.url.$setViewValue('automation-manager-url');
      $scope.angularForm.default_userid.$setViewValue('admin');
      $scope.angularForm.default_password.$setViewValue('password');
    }));

    it('returns true if all the Validation fields are filled in', function() {
      expect(vm.canValidateBasicInfo()).toBe(true);
    });
  });

  describe('Checks for validateClicked in the scope', function() {
    it('contains validateClicked in the scope', function() {
      expect(vm.validateClicked).toBeDefined();
    });
  });
});
