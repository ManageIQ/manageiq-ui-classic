describe('automationManagerFormController', function() {
  var $scope, $controller, $httpBackend, miqService;

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
      log_userid: ''
    };

    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET('/automation_manager/automation_manager_form_fields/new').respond(automationManagerFormResponse);
    $controller = _$controller_('automationManagerFormController', {
      $scope: $scope,
      automationManagerFormId: 'new',
      miqService: miqService
    });
    $httpBackend.flush();
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('initialization', function() {
    describe('when the automationManagerFormId is new', function() {
      it('sets the name to blank', function () {
        expect($scope.automationManagerModel.name).toEqual('');
      });
      it('sets the zone to blank', function () {
        expect($scope.automationManagerModel.zone).toEqual('foo_zone');
      });
      it('sets the url to blank', function () {
        expect($scope.automationManagerModel.url).toEqual('');
      });
      it('sets the verify_ssl to blank', function () {
        expect($scope.automationManagerModel.verify_ssl).toBeFalsy();
      });
      it('sets the log_userid to blank', function () {
        expect($scope.automationManagerModel.log_userid).toEqual('');
      });
      it('sets the log_password to blank', function () {
        expect($scope.automationManagerModel.log_password).toEqual('');
      });
      it('sets the log_verify to blank', function () {
        expect($scope.automationManagerModel.log_verify).toEqual('');
      });
    });

    describe('when the automationManagerFormId is an Id', function() {
      var automationManagerFormResponse = {
        name: 'Ansible',
        url: '10.10.10.10',
        zone: 'My Test Zone',
        verify_ssl: 1,
        log_userid: 'admin'
      };

      beforeEach(inject(function(_$controller_) {
        $httpBackend.whenGET('/automation_manager/automation_manager_form_fields/12345').respond(automationManagerFormResponse);
        $controller = _$controller_('automationManagerFormController',
          {
            $scope: $scope,
            automationManagerFormId: '12345',
            miqService: miqService
          });
        $httpBackend.flush();
      }));

      it('sets the name to the value returned from http request', function () {
        expect($scope.automationManagerModel.name).toEqual('Ansible');
      });
      it('sets the zone to the value returned from the http request', function () {
        expect($scope.automationManagerModel.zone).toEqual('My Test Zone');
      });
      it('sets the url to the value returned from http request', function () {
        expect($scope.automationManagerModel.url).toEqual('10.10.10.10');
      });
      it('sets the verify_ssl to the value returned from http request', function () {
        expect($scope.automationManagerModel.verify_ssl).toBeTruthy();
      });
      it('sets the log_userid to the value returned from http request', function () {
        expect($scope.automationManagerModel.log_userid).toEqual('admin');
      });
      it('sets the log_password to the value returned from http request', function () {
        expect($scope.automationManagerModel.log_password).toEqual(miqService.storedPasswordPlaceholder);
      });
      it('sets the log_verify to the value returned from http request', function () {
        expect($scope.automationManagerModel.log_verify).toEqual(miqService.storedPasswordPlaceholder);
      });
    });
  });

  describe('#resetClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function (value){},
        $setUntouched: function (value){},
      };
      $scope.resetClicked();
    });

    it('does not turn the spinner on', function() {
      expect(miqService.sparkleOn.calls.count()).toBe(0);
    });
  });

  describe('#saveClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function (value){}
      };
      $scope.saveClicked();
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
    });

    it('turns the spinner on once', function() {
      expect(miqService.sparkleOn.calls.count()).toBe(1);
    });

    it('delegates to miqService.miqAjaxButton', function() {
      expect(miqService.miqAjaxButton).toHaveBeenCalledWith('/automation_manager/edit/new?button=save', true);
    });
  });

  describe('#addClicked', function() {
    beforeEach(function() {
      $scope.angularForm = {
        $setPristine: function (value){}
      };
      $scope.addClicked();
    });

    it('turns the spinner on via the miqService', function() {
      expect(miqService.sparkleOn).toHaveBeenCalled();
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
        '<input ng-model="automationManagerModel.url" name="url" required text />' +
        '<input ng-model="automationManagerModel.log_userid" name="log_userid" required text />' +
        '<input ng-model="automationManagerModel.log_password" name="log_password" required text />' +
        '<input ng-model="automationManagerModel.log_verify" name="log_verify" required text />' +
        '</form>'
      );

      $compile(element)($scope);
      $scope.$digest();
      angularForm = $scope.angularForm;

      $scope.angularForm.url.$setViewValue('automation-manager-url');
      $scope.angularForm.log_userid.$setViewValue('admin');
      $scope.angularForm.log_password.$setViewValue('password');
      $scope.angularForm.log_verify.$setViewValue('password');
    }));

    it('returns true if all the Validation fields are filled in', function() {
      expect($scope.canValidateBasicInfo()).toBe(true);
    });
  });

  describe('Checks for validateClicked in the scope', function() {
    it('contains validateClicked in the scope', function() {
      expect($scope.validateClicked).toBeDefined();
    });
  });
});
