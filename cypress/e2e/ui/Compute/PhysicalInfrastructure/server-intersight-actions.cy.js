import { flashClassMap } from '../../../../support/assertions/assertion_constants';

// Menu options
const COMPUTE_OPTION = 'Compute';
const PHYSICAL_INFRA_OPTION = 'Physical Infrastructure';
const SERVERS_OPTION = 'Servers';

// Toolbar options
const INTERSIGHT_TOOLBAR_BUTTON = 'Intersight';
const ASSIGN_TOOLBAR_OPTION = 'Assign Server Profile';
const UNASSIGN_TOOLBAR_OPTION = 'Unassign Server Profile';
const DEPLOY_TOOLBAR_OPTION = 'Deploy Server Profile';

// Field values
const UNASSIGNED_SERVER_NAME = 'Unassigned-CI-Server';
const ASSIGNED_SERVER_NAME = 'Assigned-CI-Server';
const SERVER_PROFILE_NAME = 'CI-Server-Profile';

function createMockData({ shouldAssignServer }) {
  cy.appFactories([
    ['create', 'ems_cisco_intersight_physical_infra', { name: 'CI-Provider' }],
  ]).then((createdProviderData) => {
    const providerId = createdProviderData[0].id;
    cy.appFactories([
      [
        'create',
        'cisco_intersight_physical_server',
        'with_hardware',
        'with_asset_detail',
        {
          ems_id: providerId,
          name: shouldAssignServer
            ? ASSIGNED_SERVER_NAME
            : UNASSIGNED_SERVER_NAME,
          hostname: 'ci-server.example.com',
          ems_ref: 'mock-moid-000',
        },
      ],
    ]).then((createdServerData) => {
      cy.appFactories([
        [
          'create',
          'cisco_intersight_physical_server_profile',
          {
            ems_id: providerId,
            name: SERVER_PROFILE_NAME,
            ems_ref: 'mock-profile-moid-000',
            ...(shouldAssignServer && {
              assigned_server_id: createdServerData[0].id,
            }),
          },
        ],
      ]);
    });
  });
}

function verifyAssignedServerAction({ toolbarOption, action }) {
  cy.toolbar(INTERSIGHT_TOOLBAR_BUTTON, ASSIGN_TOOLBAR_OPTION, {
    assertOptionDisabled: true,
  });
  // Not using cy.interceptApi because it currently can't intercept multiple requests triggered by a single event
  cy.intercept(
    'GET',
    '/api/physical_servers/*?attributes=assigned_server_profile.id'
  ).as('getServerProfileId');
  cy.intercept('POST', 'api/physical_server_profiles').as('actionApi');
  const taskResultsMockResponse = {
    state: 'Finished',
    status: 'Ok',
    message: `${action} action successful`,
  };
  cy.intercept(
    'GET',
    '/api/tasks/*?attributes=task_results',
    taskResultsMockResponse
  ).as('taskResultsApi');
  cy.toolbar(INTERSIGHT_TOOLBAR_BUTTON, toolbarOption);
  cy.wait(['@getServerProfileId', '@actionApi', '@taskResultsApi']);
  cy.expect_flash(flashClassMap.success, `Performing ${action}`);
  cy.expect_flash(flashClassMap.success, taskResultsMockResponse.message);
}

describe(`Automate intersight server actions: ${COMPUTE_OPTION} > ${PHYSICAL_INFRA_OPTION} > ${SERVERS_OPTION}`, () => {
  describe(`Validate ${INTERSIGHT_TOOLBAR_BUTTON} > ${ASSIGN_TOOLBAR_OPTION}`, () => {
    beforeEach(() => {
      createMockData({ shouldAssignServer: false });
      cy.login();
      cy.menu(COMPUTE_OPTION, PHYSICAL_INFRA_OPTION, SERVERS_OPTION);
      cy.clickTableRowByText({ text: UNASSIGNED_SERVER_NAME, columnIndex: 1 });
    });

    it('Verify assign server workflow works as expected', () => {
      cy.toolbar(INTERSIGHT_TOOLBAR_BUTTON, DEPLOY_TOOLBAR_OPTION, {
        assertOptionDisabled: true,
      });
      cy.toolbar(INTERSIGHT_TOOLBAR_BUTTON, UNASSIGN_TOOLBAR_OPTION, {
        assertOptionDisabled: true,
      });
      cy.toolbar(INTERSIGHT_TOOLBAR_BUTTON, ASSIGN_TOOLBAR_OPTION);
      cy.get('#provider-modal').should('be.visible');
      cy.getFormSelectFieldById({ selectId: 'server_profile' }).select(
        SERVER_PROFILE_NAME
      );
      const taskResultsMockResponse = {
        state: 'Finished',
        status: 'Ok',
        message: 'assign_server action successful',
      };
      // Not using cy.interceptApi because it currently can't intercept multiple requests triggered by a single event
      cy.intercept('POST', 'api/physical_server_profiles').as('actionApi');
      cy.intercept(
        'GET',
        '/api/tasks/*?attributes=task_results',
        taskResultsMockResponse
      ).as('taskResultsApi');
      cy.contains('button.cds--btn', 'Assign').click();
      cy.wait(['@actionApi', '@taskResultsApi']);
      cy.get('#provider-modal').should('not.exist');
      cy.expect_flash(flashClassMap.success, 'Performing assign_server');
      cy.expect_flash(flashClassMap.success, taskResultsMockResponse.message);
    });
  });

  describe(`Validate ${INTERSIGHT_TOOLBAR_BUTTON} > ${UNASSIGN_TOOLBAR_OPTION}/${DEPLOY_TOOLBAR_OPTION}`, () => {
    beforeEach(() => {
      createMockData({ shouldAssignServer: true });
      cy.login();
      cy.menu(COMPUTE_OPTION, PHYSICAL_INFRA_OPTION, SERVERS_OPTION);
      cy.clickTableRowByText({ text: ASSIGNED_SERVER_NAME, columnIndex: 1 });
    });

    it('Verify deploy server workflow works as expected', () => {
      verifyAssignedServerAction({
        toolbarOption: DEPLOY_TOOLBAR_OPTION,
        action: 'deploy_server',
      });
    });

    it('Verify unassign server workflow works as expected', () => {
      verifyAssignedServerAction({
        toolbarOption: UNASSIGN_TOOLBAR_OPTION,
        action: 'unassign_server',
      });
    });
  });

  afterEach(() => {
    cy.appDbState('restore');
  });
});
