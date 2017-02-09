describe('alertsCenterService', function() {
  var testService, $timeout, API, $q, $rootScope;
  var adminResponse, operatorResponse, existingUsersResponse, providersResponse, tagsResponse, alertsResponse;
  var deferred;

  beforeEach(module('alertsCenter'));

  beforeEach(inject(function(_$timeout_, _alertsCenterService_, _API_, _$q_, _$rootScope_) {
    testService = _alertsCenterService_;
    $timeout = _$timeout_;
    API = _API_;
    $q = _$q_;
    $rootScope = _$rootScope_;

    adminResponse = getJSONFixture('alerts_center/admin_user_response.json');
    operatorResponse = getJSONFixture('alerts_center/operator_user_response.json');
    existingUsersResponse = getJSONFixture('alerts_center/existing_users_response.json');
    providersResponse = getJSONFixture('alerts_center/providers_response.json');
    tagsResponse = getJSONFixture('alerts_center/tags_response.json');
    alertsResponse = getJSONFixture('alerts_center/alerts_response.json');
  }));

  describe('static values', function() {
    it('should give the correct severity titles', function() {
      var titles = testService.severityTitles;
      expect(titles.length).toBe(3);
      expect(titles[0]).toBe(__("Information"));
      expect(titles[1]).toBe(__("Warning"));
      expect(titles[2]).toBe(__("Error"));
    });

    it('should give the correct filter choices', function() {
      var filters = testService.alertListFilterFields;
      expect(filters.length).toBe(7);

      expect(filters[0].title).toBe(__("Severity"));
      expect(filters[0].filterValues).toBe(testService.severityTitles);
      expect(filters[1].title).toBe(__("Host Name"));
      expect(filters[2].title).toBe(__("Provider Name"));
      expect(filters[3].title).toBe(__("Provider Type"));
      expect(filters[3].filterValues).toBe(testService.objectTypes);
      expect(filters[4].title).toBe(__("Message Text"));
      expect(filters[5].title).toBe(__("Owner"));
      expect(filters[6].title).toBe(__("Acknowledged"));
      expect(filters[6].filterValues.length).toBe(2);
      expect(filters[6].filterValues[0]).toBe(__('Acknowledged'));
      expect(filters[6].filterValues[1]).toBe(__('Unacknowledged'));
    });

    it('should give the correct sort options', function() {
      var sortFields = testService.alertListSortFields;
      expect(sortFields.length).toBe(7);

      expect(sortFields[0].title).toBe(__("Time"));
      expect(sortFields[1].title).toBe(__("Severity"));
      expect(sortFields[2].title).toBe(__("Host Name"));
      expect(sortFields[3].title).toBe(__("Provider Name"));
      expect(sortFields[4].title).toBe(__("Provider Type"));
      expect(sortFields[5].title).toBe(__("Owner"));
      expect(sortFields[6].title).toBe(__("Acknowledged"));
    });

    it('should give the correct menu actions', function() {
      var menuActions = testService.menuActions;
      expect(menuActions.length).toBe(5);

      expect(menuActions[0].name).toBe(__("Acknowledge"));
      expect(menuActions[1].name).toBe(__("Add Note"));
      expect(menuActions[2].name).toBe(__("Assign"));
      expect(menuActions[3].name).toBe(__("Unacknowledge"));
      expect(menuActions[4].name).toBe(__("Unassign"));
    });
  });

  describe('update commands', function() {

    beforeEach(function() {
      deferred = $q.defer();

      spyOn(API, 'get').and.callFake(function() {return deferred.promise;});
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
    });

    it('should convert into an alert list correctly', function() {
      var alertsList = testService.convertToAlertsList(alertsResponse);

      expect(alertsList.length).toBe(4);

      expect(alertsList[0].objectType).toBe("Hawkular");
      expect(alertsList[0].objectTypeImg).toMatch(/svg\/vendor-hawkular/);
      expect(alertsList[0].assigned).toBe(true);

      expect(alertsList[1].objectType).toBe("Hawkular");
      expect(alertsList[1].objectTypeImg).toMatch(/svg\/vendor-hawkular/);
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
