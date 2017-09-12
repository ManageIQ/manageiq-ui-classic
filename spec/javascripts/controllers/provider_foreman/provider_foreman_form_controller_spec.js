describe('providerForemanFormController', function() {
  var $scope, vm, $httpBackend, miqService;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(_$httpBackend_, $rootScope, _$controller_, _miqService_) {
    miqService = _miqService_;
    spyOn(miqService, 'showButtons');
    spyOn(miqService, 'hideButtons');
    spyOn(miqService, 'miqAjaxButton');
    spyOn(miqService, 'sparkleOn');
    spyOn(miqService, 'sparkleOff');
    $scope = $rootScope.$new();

    var providerForemanFormResponse = {
      name: '',
      url: '',
      zone: 'foo_zone',
      verify_ssl: 0,
      default_userid: ''
    };

    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET('/provider_foreman/form_fields/new').respond(providerForemanFormResponse);
    vm = _$controller_('providerForemanFormController', {
      $scope: $scope,
      providerForemanFormId: 'new',
      miqService: miqService
    });
    $httpBackend.flush();
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('initialization', function() {
    describe('when the providerForemanFormId is new', function() {
      it('sets the name to blank', function () {
        expect(vm.providerForemanModel.name).toEqual('');
      });
      it('sets the zone to blank', function () {
        expect(vm.providerForemanModel.zone).toEqual('foo_zone');
      });
      it('sets the url to blank', function () {
        expect(vm.providerForemanModel.url).toEqual('');
      });
      it('sets the verify_ssl to blank', function () {
        expect(vm.providerForemanModel.verify_ssl).toBeFalsy();
      });
      it('sets the default_userid to blank', function () {
        expect(vm.providerForemanModel.default_userid).toEqual('');
      });
      it('sets the default_password to blank', function () {
        expect(vm.providerForemanModel.default_password).toEqual('');
      });
    });

    describe('when the providerForemanFormId is an Id', function() {
      var providerForemanFormResponse = {
        name: 'Foreman',
        url: '10.10.10.10',
        zone: 'My Test Zone',
        verify_ssl: 1,
        default_userid: 'admin'
      };

      beforeEach(inject(function(_$controller_) {
        $httpBackend.whenGET('/provider_foreman/form_fields/12345').respond(providerForemanFormResponse);
        vm = _$controller_('providerForemanFormController',
          {
            $scope: $scope,
            providerForemanFormId: '12345',
            miqService: miqService
          });
        $httpBackend.flush();
      }));

      it('sets the name to the value returned from http request', function () {
        expect(vm.providerForemanModel.name).toEqual('Foreman');
      });
      it('sets the zone to the value returned from the http request', function () {
        expect(vm.providerForemanModel.zone).toEqual('My Test Zone');
      });
      it('sets the url to the value returned from http request', function () {
        expect(vm.providerForemanModel.url).toEqual('10.10.10.10');
      });
      it('sets the verify_ssl to the value returned from http request', function () {
        expect(vm.providerForemanModel.verify_ssl).toBeTruthy();
      });
      it('sets the default_userid to the value returned from http request', function () {
        expect(vm.providerForemanModel.default_userid).toEqual('admin');
      });
      it('sets the default_password to the value returned from http request', function () {
        expect(vm.providerForemanModel.default_password).toEqual(miqService.storedPasswordPlaceholder);
      });
    });
  });

  describe('#resetClicked', function() {
    beforeEach(function() {
      var angularForm = {
        $setPristine: function (value){},
        $setUntouched: function (value){},
      };
      vm.resetClicked(angularForm);
    });

    it('does not turn the spinner on', function() {
      expect(miqService.sparkleOn.calls.count()).toBe(0);
    });
  });

  describe('#saveClicked', function() {
    beforeEach(function() {
      var angularForm = {
        $setPristine: function (value){}
      };
      vm.saveClicked(angularForm);
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });

    it('turns the spinner on once', function() {
      expect(miqService.sparkleOn.calls.count()).toBe(1);
    });

    it('delegates to miqService.miqAjaxButton', function() {
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/provider_foreman/edit/new?button=save',
        vm.providerForemanModel);
    });
  });

  describe('#addClicked', function() {
    beforeEach(function() {
      var angularForm = {
        $setPristine: function (value){}
      };
      vm.addClicked(angularForm);
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });

    it('delegates to miqService.miqAjaxButton', function() {
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/provider_foreman/edit/new?button=save',
        vm.providerForemanModel);
    });
  });

  describe('Validates credential fields', function() {
    beforeEach(inject(function($compile, miqService) {
      var element = angular.element(
        '<form name="angularForm">' +
        '<input ng-model="vm.providerForemanModel.url" name="url" required text />' +
        '<input ng-model="vm.providerForemanModel.default_userid" name="default_userid" required text />' +
        '<input ng-model="vm.providerForemanModel.default_password" name="default_password" required text />' +
        '</form>'
      );

      $compile(element)($scope);
      $scope.$digest();

      $scope.angularForm.url.$setViewValue('foreman-url');
      $scope.angularForm.default_userid.$setViewValue('admin');
      $scope.angularForm.default_password.$setViewValue('password');
    }));

    it('returns true if all the Validation fields are filled in', function() {
      expect(vm.isBasicInfoValid($scope.angularForm)).toBe(true);
    });
  });

  describe('Checks for validateClicked in the scope', function() {
    it('contains validateClicked in the scope', function() {
      expect(vm.validateClicked).toBeDefined();
    });
  });
});
