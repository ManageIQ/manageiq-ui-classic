describe('alertsCenterService', function() {
  var testService, $timeout, API, $http, $q, $rootScope;
  var adminResponse, operatorResponse, existingUsersResponse, providersResponse, tagsResponse, iconsResponse,
    alertsResponse;
  var deferred;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(_$timeout_, _alertsCenterService_, _API_, _$http_, _$q_, _$rootScope_) {
    testService = _alertsCenterService_;
    $timeout = _$timeout_;
    API = _API_;
    $http =_$http_;
    $q = _$q_;
    $rootScope = _$rootScope_;

    adminResponse = getJSONFixture('alerts_center/admin_user_response.json');
    operatorResponse = getJSONFixture('alerts_center/operator_user_response.json');
    existingUsersResponse = getJSONFixture('alerts_center/existing_users_response.json');
    providersResponse = getJSONFixture('alerts_center/providers_response.json');
    tagsResponse = getJSONFixture('alerts_center/tags_response.json');
    iconsResponse = getJSONFixture('alerts_center/icons_response.json');
    alertsResponse = getJSONFixture('alerts_center/alerts_response.json');
  }));

  describe('static values', function() {
    it('should give the correct severity titles', function() {
      var titles = testService.severityTitles;
      expect(titles.length).toBe(3);
      expect(titles[0]).toBe("Information");
      expect(titles[1]).toBe("Warning");
      expect(titles[2]).toBe("Error");
    });

    it('should give the correct filter choices', function() {
      var filters = testService.alertListFilterFields;
      expect(filters.length).toBe(7);

      expect(filters[0].title).toBe("Severity");
      expect(filters[0].filterValues).toBe(testService.severityTitles);
      expect(filters[1].title).toBe("Host Name");
      expect(filters[2].title).toBe("Provider Name");
      expect(filters[3].title).toBe("Provider Type");
      expect(filters[3].filterValues).toBe(testService.objectTypes);
      expect(filters[4].title).toBe("Message Text");
      expect(filters[5].title).toBe("Owner");
      expect(filters[6].title).toBe("Acknowledged");
      expect(filters[6].filterValues.length).toBe(2);
      expect(filters[6].filterValues[0]).toBe('Acknowledged');
      expect(filters[6].filterValues[1]).toBe('Unacknowledged');
    });

    it('should give the correct sort options', function() {
      var sortFields = testService.alertListSortFields;
      expect(sortFields.length).toBe(7);

      expect(sortFields[0].title).toBe("Time");
      expect(sortFields[1].title).toBe("Severity");
      expect(sortFields[2].title).toBe("Host Name");
      expect(sortFields[3].title).toBe("Provider Name");
      expect(sortFields[4].title).toBe("Provider Type");
      expect(sortFields[5].title).toBe("Owner");
      expect(sortFields[6].title).toBe("Acknowledged");
    });

    it('should give the correct menu actions', function() {
      var menuActions = testService.menuActions;
      expect(menuActions.length).toBe(5);

      expect(menuActions[0].name).toBe("Acknowledge");
      expect(menuActions[1].name).toBe("Add Note");
      expect(menuActions[2].name).toBe("Assign");
      expect(menuActions[3].name).toBe("Unacknowledge");
      expect(menuActions[4].name).toBe("Unassign");
    });
  });

  describe('update commands', function() {

    beforeEach(function() {
      deferred = $q.defer();

      spyOn(API, 'get').and.callFake(function() {return deferred.promise;});
      spyOn($http, 'get').and.callFake(function() {return deferred.promise;});
    });

    it('should get the current user correctly', function() {
      testService.getCurrentUser();

      deferred.resolve(adminResponse);
      $rootScope.$apply();

      expect(testService.currentUser.userid).toBe('admin');
    });

    it('should update existing user correctly', function() {
      testService.currentUser = adminResponse.identity;

      testService.updateExistingUsers();

      deferred.resolve(existingUsersResponse);
      $rootScope.$apply();

      expect(testService.existingUsers.length).toBe(2);
    });

    it('should update existing providers correctly', function() {
      testService.updateProviders();

      deferred.resolve(providersResponse);
      $rootScope.$apply();

      expect(testService.providers.length).toBe(4);
    });

    it('should update existing tags correctly', function() {

      testService.updateTags();

      deferred.resolve(tagsResponse);
      $rootScope.$apply();

      expect(testService.tags.length).toBe(4);
    });

    it('should retrieve existing alerts correctly', function() {
      var alerts = [];

      testService.getAlertsData().then(function(response) {
        alerts = response.resources;
        return true;
      });

      deferred.resolve(alertsResponse);
      $rootScope.$apply();

      expect(alerts.length).toBe(4);
    });
  });

  describe('convert functions', function() {
    beforeEach(function() {
      testService.currentUser = adminResponse.identity;
      testService.existingUsers = existingUsersResponse.resources;
      testService.providers = providersResponse.resources;
      testService.tags = tagsResponse.resources;
      testService.icons = iconsResponse;
    });

    it('should convert into an alert list correctly', function() {
      var alertsList = testService.convertToAlertsList(alertsResponse);

      expect(alertsList.length).toBe(4);

      expect(alertsList[0].objectType).toBe("Openshift");
      expect(alertsList[0].objectTypeImg).toMatch(/svg\/vendor-openshift/);
      expect(alertsList[0].assigned).toBe(true);

      expect(alertsList[1].objectType).toBe("Openshift");
      expect(alertsList[1].objectTypeImg).toMatch(/svg\/vendor-openshift/);
      expect(alertsList[1].assigned).toBe(false);

      expect(alertsList[2].objectType).toBe("Openshift");
      expect(alertsList[2].objectTypeImg).toMatch(/svg\/vendor-openshift/);
      expect(alertsList[2].assigned).toBe(true);
    });

    it('should convert into an alert overview items correctly', function() {
      var overviewItems = testService.convertToAlertsOverview(alertsResponse);

      expect(overviewItems.length).toBe(3);

      expect(overviewItems[0].id).toBe(1);
      expect(overviewItems[0].name).toBe('Provider 1');
      expect(overviewItems[0].displayType).toBe('providers');
      expect(overviewItems[0].tags.length).toBe(1);
      expect(overviewItems[0].error.length).toBe(0);
      expect(overviewItems[0].warning.length).toBe(1);
      expect(overviewItems[0].info.length).toBe(1);

      expect(overviewItems[1].id).toBe(2);
      expect(overviewItems[1].name).toBe('Provider 2');
      expect(overviewItems[1].displayType).toBe('providers');
      expect(overviewItems[1].tags.length).toBe(1);
      expect(overviewItems[1].error.length).toBe(1);
      expect(overviewItems[1].warning.length).toBe(0);
      expect(overviewItems[1].info.length).toBe(0);

    });
  });
});
