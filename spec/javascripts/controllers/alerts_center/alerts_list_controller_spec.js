describe('alertsListController', function() {
  var $scope, $controller, alertsCenterService;
  var adminResponse, operatorResponse, existingUsersResponse, providersResponse, tagsResponse, iconsResponse,
    alertsResponse;

  beforeEach(module('ManageIQ'));

  beforeEach(function() {
    var $window = {location: { pathname: '/alerts_overview/show' }};

    module(function($provide) {
      $provide.value('$window', $window);
    });
  });

  beforeEach(inject(function(_$rootScope_, _$controller_, _alertsCenterService_) {
    $scope = _$rootScope_.$new();
    alertsCenterService = _alertsCenterService_;

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
      alertsCenterService.currentUser.id = 1;
      alertsCenterService.existingUsers = existingUsersResponse.resources;
      alertsCenterService.providers = providersResponse.resources;
      alertsCenterService.tags = tagsResponse.resources;
      alertsCenterService.icons = iconsResponse;

      return Promise.resolve(alertsResponse);
    };

    spyOn(alertsCenterService, 'updateAlertsData').and.callFake(fakeGetAlerts);

    $controller = _$controller_('alertsListController',
      {
        $scope: $scope,
        alertsCenterService: alertsCenterService
      }
    );
  }));

  describe('data loads successfully and', function() {
    it('shows the correct alerts', function(done) {
      expect($controller.loadingDone).toBeFalsy();

      setTimeout(function () {
        expect($controller.loadingDone).toBeTruthy();
        expect($controller.alerts.length).toBe(4);
        expect($controller.alertsList.length).toBe(4);
        done();
      });
    });

    it('filters out items appropriately', function(done) {
      setTimeout(function () {
        $controller.filterConfig.appliedFilters = [{id: 'severity', value: 'Error'}];
        $controller.filterChange();
        expect($controller.alerts.length).toBe(4);
        expect($controller.alertsList.length).toBe(2);

        done();
      });
    });

    it('shows the appropriate actions for items', function(done) {
      setTimeout(function () {
        var acknowledgeAction = alertsCenterService.menuActions[0];
        var commentAction = alertsCenterService.menuActions[1];
        var assignAction = alertsCenterService.menuActions[2];
        var unacknowledgeAction = alertsCenterService.menuActions[3];
        var unassignAction = alertsCenterService.menuActions[4];


        expect(acknowledgeAction.id).toBe('acknowledge');
        expect(commentAction.id).toBe('addcomment');
        expect(assignAction.id).toBe('assign');
        expect(unacknowledgeAction.id).toBe('unacknowledge');
        expect(unassignAction.id).toBe('unassign');

        expect($controller.alertsList[0].assigned).toBeTruthy();
        expect($controller.alertsList[0].assignee_id).toBe(2);
        expect($controller.alertsList[0].acknowledged).toBeFalsy();

        alertsCenterService.updateMenuActionForItemFn (acknowledgeAction, $controller.alertsList[0]);
        expect(acknowledgeAction.isVisible).toBe(false);

        alertsCenterService.updateMenuActionForItemFn (commentAction, $controller.alertsList[0]);
        expect(commentAction.isVisible).toBe(true);

        alertsCenterService.updateMenuActionForItemFn (assignAction, $controller.alertsList[0]);
        expect(assignAction.isVisible).toBe(true);

        alertsCenterService.updateMenuActionForItemFn (unacknowledgeAction, $controller.alertsList[0]);
        expect(unacknowledgeAction.isVisible).toBe(false);

        alertsCenterService.updateMenuActionForItemFn (unassignAction, $controller.alertsList[0]);
        expect(unassignAction.isVisible).toBe(true);

        expect($controller.alertsList[1].assigned).toBeFalsy();
        expect($controller.alertsList[1].assignee_id).toBeUndefined();
        expect($controller.alertsList[1].acknowledged).toBeFalsy();


        alertsCenterService.updateMenuActionForItemFn (acknowledgeAction, $controller.alertsList[1]);
        expect(acknowledgeAction.isVisible).toBe(false);

        alertsCenterService.updateMenuActionForItemFn (commentAction, $controller.alertsList[1]);
        expect(commentAction.isVisible).toBe(true);

        alertsCenterService.updateMenuActionForItemFn (assignAction, $controller.alertsList[1]);
        expect(assignAction.isVisible).toBe(true);

        alertsCenterService.updateMenuActionForItemFn (unacknowledgeAction, $controller.alertsList[1]);
        expect(unacknowledgeAction.isVisible).toBe(false);

        alertsCenterService.updateMenuActionForItemFn (unassignAction, $controller.alertsList[1]);
        expect(unassignAction.isVisible).toBe(false);

        expect($controller.alertsList[2].assigned).toBeFalsy();
        expect($controller.alertsList[2].assignee_id).toBeUndefined(2);
        expect($controller.alertsList[2].acknowledged).toBeFalsy();


        alertsCenterService.updateMenuActionForItemFn (acknowledgeAction, $controller.alertsList[2]);
        expect(acknowledgeAction.isVisible).toBe(false);

        alertsCenterService.updateMenuActionForItemFn (commentAction, $controller.alertsList[2]);
        expect(commentAction.isVisible).toBe(true);

        alertsCenterService.updateMenuActionForItemFn (assignAction, $controller.alertsList[2]);
        expect(assignAction.isVisible).toBe(true);

        alertsCenterService.updateMenuActionForItemFn (unacknowledgeAction, $controller.alertsList[2]);
        expect(unacknowledgeAction.isVisible).toBe(false);

        alertsCenterService.updateMenuActionForItemFn (unassignAction, $controller.alertsList[2]);
        expect(unassignAction.isVisible).toBe(false);

        expect($controller.alertsList[3].assigned).toBeTruthy();
        expect($controller.alertsList[3].assignee_id).toBe(1);
        expect($controller.alertsList[3].acknowledged).toBeTruthy();


        alertsCenterService.updateMenuActionForItemFn (acknowledgeAction, $controller.alertsList[3]);
        expect(acknowledgeAction.isVisible).toBe(false);

        alertsCenterService.updateMenuActionForItemFn (commentAction, $controller.alertsList[3]);
        expect(commentAction.isVisible).toBe(true);

        alertsCenterService.updateMenuActionForItemFn (assignAction, $controller.alertsList[3]);
        expect(assignAction.isVisible).toBe(true);

        alertsCenterService.updateMenuActionForItemFn (unacknowledgeAction, $controller.alertsList[3]);
        expect(unacknowledgeAction.isVisible).toBe(true);

        alertsCenterService.updateMenuActionForItemFn (unassignAction, $controller.alertsList[3]);
        expect(unassignAction.isVisible).toBe(true);

        alertsCenterService.currentUser.id = 2;

        alertsCenterService.updateMenuActionForItemFn (unacknowledgeAction, $controller.alertsList[3]);
        expect(unacknowledgeAction.isVisible).toBe(false);

        done();
      });
    });

    it('sorts items appropriately', function(done) {
      setTimeout(function () {
        expect($controller.alerts.length).toBe(4);
        expect($controller.alertsList.length).toBe(4);

        expect($controller.alertsList[0].severityInfo.severityClass).toBe('alert-danger');
        expect($controller.alertsList[0].objectName).toBe('Provider 2');

        expect($controller.alertsList[1].severityInfo.severityClass).toBe('alert-danger');
        expect($controller.alertsList[1].objectName).toBe('Provider 4');

        expect($controller.alertsList[2].severityInfo.severityClass).toBe('alert-warning');
        expect($controller.alertsList[2].objectName).toBe('Provider 1');

        expect($controller.alertsList[3].severityInfo.severityClass).toBe('alert-info');
        expect($controller.alertsList[3].objectName).toBe('Provider 1');

        $controller.sortConfig.isAscending = true;
        $controller.filterChange();

        expect($controller.alertsList[0].severityInfo.severityClass).toBe('alert-info');
        expect($controller.alertsList[0].objectName).toBe('Provider 1');

        expect($controller.alertsList[1].severityInfo.severityClass).toBe('alert-warning');
        expect($controller.alertsList[1].objectName).toBe('Provider 1');

        expect($controller.alertsList[2].severityInfo.severityClass).toBe('alert-danger');
        expect($controller.alertsList[2].objectName).toBe('Provider 2');

        expect($controller.alertsList[3].severityInfo.severityClass).toBe('alert-danger');
        expect($controller.alertsList[3].objectName).toBe('Provider 4');

        // Sort by Name
        $controller.sortConfig.currentField = alertsCenterService.alertListSortFields[2];
        $controller.filterChange();

        expect($controller.alertsList[0].severityInfo.severityClass).toBe('alert-info');
        expect($controller.alertsList[0].objectName).toBe('Provider 1');

        expect($controller.alertsList[1].severityInfo.severityClass).toBe('alert-warning');
        expect($controller.alertsList[1].objectName).toBe('Provider 1');

        expect($controller.alertsList[2].severityInfo.severityClass).toBe('alert-danger');
        expect($controller.alertsList[2].objectName).toBe('Provider 2');

        expect($controller.alertsList[3].severityInfo.severityClass).toBe('alert-danger');
        expect($controller.alertsList[3].objectName).toBe('Provider 4');

        $controller.sortConfig.isAscending = false;
        $controller.filterChange();

        expect($controller.alertsList[0].severityInfo.severityClass).toBe('alert-danger');
        expect($controller.alertsList[0].objectName).toBe('Provider 4');

        expect($controller.alertsList[1].severityInfo.severityClass).toBe('alert-danger');
        expect($controller.alertsList[1].objectName).toBe('Provider 2');

        expect($controller.alertsList[2].severityInfo.severityClass).toBe('alert-warning');
        expect($controller.alertsList[2].objectName).toBe('Provider 1');

        expect($controller.alertsList[3].severityInfo.severityClass).toBe('alert-info');
        expect($controller.alertsList[3].objectName).toBe('Provider 1');

        done();
      });
    });
  });
});
