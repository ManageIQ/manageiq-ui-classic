describe('alertsOverviewController', function() {
  var $scope, $controller, alertsCenterService;
  var adminResponse, operatorResponse, existingUsersResponse, providersResponse, tagsResponse, alertsResponse,
    iconsResponse;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function(_$rootScope_, _$controller_, _alertsCenterService_) {
    $scope = _$rootScope_.$new();
    alertsCenterService = _alertsCenterService_;

    var dummyDocument = document.createElement('div');
    spyOn(document, 'getElementById').and.returnValue(dummyDocument);

    alertsCenterService.refreshInterval = -1;
    adminResponse = getJSONFixture('alerts_center/admin_user_response.json');
    operatorResponse = getJSONFixture('alerts_center/operator_user_response.json');
    existingUsersResponse = getJSONFixture('alerts_center/existing_users_response.json');
    providersResponse = getJSONFixture('alerts_center/providers_response.json');
    tagsResponse = getJSONFixture('alerts_center/tags_response.json');
    iconsResponse = getJSONFixture('alerts_center/icons_response.json');
    alertsResponse = getJSONFixture('alerts_center/alerts_response.json');

    fakeGetAlerts = function() {
      alertsCenterService.currentUser = adminResponse.identity;
      alertsCenterService.existingUsers = existingUsersResponse.resources;
      alertsCenterService.providers = providersResponse.resources;
      alertsCenterService.icons = iconsResponse;
      alertsCenterService.tags = tagsResponse.resources;

      return Promise.resolve(alertsResponse);
    };

    spyOn(alertsCenterService, 'updateAlertsData').and.callFake(fakeGetAlerts);

    $controller = _$controller_('alertsOverviewController',
      {
        $scope: $scope,
        alertsCenterService: alertsCenterService
      }
    );
  }));

  describe('data loads successfully and', function() {
    it('shows the correct summary item cards', function(done) {
      expect($controller.loadingDone).toBeFalsy();

      setTimeout(function () {
        expect($controller.loadingDone).toBeTruthy();
        expect($controller.groups.length).toBe(3);
        expect($controller.displayFilters.length).toBe(1);
        expect($controller.categories.length).toBe(1);
        done();
      });
    });

    it('shows the correct items in the summary cards', function(done) {
      setTimeout(function () {
        expect($controller.groups.length).toBe(3);
        expect($controller.groups[0].hasItems).toBeTruthy();
        expect($controller.groups[0].itemsList.length).toBe(1);
        expect($controller.groups[0].itemsList[0].error.length).toBe(1);
        expect($controller.groups[0].itemsList[0].info.length).toBe(0);
        expect($controller.groups[0].itemsList[0].warning.length).toBe(0);

        expect($controller.groups[1].hasItems).toBeTruthy();
        expect($controller.groups[1].itemsList.length).toBe(1);
        expect($controller.groups[1].itemsList[0].error.length).toBe(0);
        expect($controller.groups[1].itemsList[0].info.length).toBe(1);
        expect($controller.groups[1].itemsList[0].warning.length).toBe(1);

        expect($controller.groups[2].hasItems).toBeTruthy();
        expect($controller.groups[2].itemsList.length).toBe(1);
        expect($controller.groups[2].itemsList[0].error.length).toBe(1);
        expect($controller.groups[2].itemsList[0].info.length).toBe(0);
        expect($controller.groups[2].itemsList[0].warning.length).toBe(0);

        done();
      });
    });

    it('filters out cards appropriately', function(done) {
      setTimeout(function () {
        $controller.filterConfig.appliedFilters = [{id: 'severityCount', value: 'Error'}];
        $controller.filterChange();

        expect($controller.groups.length).toBe(3);
        expect($controller.groups[0].hasItems).toBeTruthy();
        expect($controller.groups[1].hasItems).toBeFalsy();
        expect($controller.groups[2].hasItems).toBeTruthy();

        $controller.filterConfig.appliedFilters = [{id: 'name', value: '1'}];
        $controller.filterChange();

        expect($controller.groups.length).toBe(3);
        expect($controller.groups[0].hasItems).toBeFalsy();
        expect($controller.groups[1].hasItems).toBeTruthy();
        expect($controller.groups[2].hasItems).toBeFalsy();

        done();
      });
    });
  });
});
