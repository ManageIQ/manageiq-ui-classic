import { flashClassMap } from '../../../../support/assertions/assertion_constants.js';

// Menu options
const STORAGE_MENU_OPTION = 'Storage';
const STORAGE_SERVICES_MENU_OPTION = 'Storage Services';

// Toolbar options
const TOOLBAR_CONFIGURATION = 'Configuration';
const TOOLBAR_DELETE_STORAGE_SERVICE = 'Delete the Storage Service';
const TOOLBAR_ADD_NEW_STORAGE_SERVICE = 'Create a new storage service';
const TOOLBAR_EDIT_STORAGE_SERVICE = 'Edit selected Storage Service';

// Field labels
const CAPABILITIES_SUB_HEADER = 'Required Capabilities';

// Field values
const NA_VALUE = '-1';
const TRUE_VALUE = 'True';
const STORAGE_MANAGER_NAME = 'Test Autosde Manager';
const STORAGE_RESOURCE_1 = 'Test Autosde Storage Resource 1';
const STORAGE_RESOURCE_2 = 'Test Autosde Storage Resource 2';
const STORAGE_RESOURCE_3 = 'Test Autosde Storage Resource 3';
const STORAGE_RESOURCE_1_EMS_REF = 'resource-001';
const STORAGE_RESOURCE_2_EMS_REF = 'resource-002';
const STORAGE_RESOURCE_3_EMS_REF = 'resource-003';
const STORAGE_SERVICE_NAME = 'Test Autosde Storage Service';
const STORAGE_SERVICE_DESCRIPTION = 'Test description';

// Buttons
const CHECK_COMPILANCE_BUTTON_TEXT = 'Check Compliant Resources';
const ADD_BUTTON_TEXT = 'Add';
const SAVE_BUTTON_TEXT = 'Save';

// Flash message text snippets
const FLASH_MESSAGE_ADD = 'add';
const FLASH_MESSAGE_DELETE = 'delete';
const FLASH_MESSAGE_EDIT = 'modification';

function createStorageData({ shouldCreateStorageService = false }) {
  cy.appFactories([
    [
      'create',
      'ems_autosde',
      {
        name: STORAGE_MANAGER_NAME,
        capabilities: {
          compression: [
            { uuid: 'comp-true-001', value: 'True' },
            { uuid: 'comp-false-001', value: 'False' },
          ],
          thin_provision: [
            { uuid: 'thin-true-001', value: 'True' },
            { uuid: 'thin-false-001', value: 'False' },
          ],
        },
      },
    ],
  ]).then((createdStorageManagerData) => {
    expect(createdStorageManagerData.length).to.equal(1);
    const storageManagerId = createdStorageManagerData?.[0].id;
    cy.appFactories([
      [
        'create',
        'autosde_storage_resource',
        {
          name: STORAGE_RESOURCE_1,
          ems_id: storageManagerId,
          ems_ref: STORAGE_RESOURCE_1_EMS_REF,
          capabilities: {
            compression: ['True'],
            thin_provision: ['True'],
          },
        },
      ],
      [
        'create',
        'autosde_storage_resource',
        {
          name: STORAGE_RESOURCE_2,
          ems_id: storageManagerId,
          ems_ref: STORAGE_RESOURCE_2_EMS_REF,
          capabilities: {
            compression: ['False'],
            thin_provision: ['True'],
          },
        },
      ],
      [
        'create',
        'autosde_storage_resource',
        {
          name: STORAGE_RESOURCE_3,
          ems_id: storageManagerId,
          ems_ref: STORAGE_RESOURCE_3_EMS_REF,
          capabilities: {
            compression: ['True', 'False'],
            thin_provision: ['True', 'False'],
          },
        },
      ],
    ]).then((createdStorageResourceData) => {
      expect(createdStorageResourceData.length).to.equal(3);
      if (shouldCreateStorageService) {
        cy.appFactories([
          [
            'create',
            'autosde_storage_service',
            {
              name: STORAGE_SERVICE_NAME,
              ems_id: storageManagerId,
            },
          ],
        ]).then((createdStorageServiceData) => {
          expect(createdStorageServiceData.length).to.equal(1);
          cy.menu(STORAGE_MENU_OPTION, STORAGE_SERVICES_MENU_OPTION);
        });
      } else {
        cy.menu(STORAGE_MENU_OPTION, STORAGE_SERVICES_MENU_OPTION);
      }
    });
  });
}

describe(`Automate Storage Service form operations: ${STORAGE_MENU_OPTION} > ${STORAGE_SERVICES_MENU_OPTION}`, () => {
  beforeEach(() => {
    cy.login();
  });

  afterEach(() => {
    cy.appDbState('restore');
  });

  describe(`Verify add Form behavior: ${TOOLBAR_CONFIGURATION} > ${TOOLBAR_ADD_NEW_STORAGE_SERVICE}`, () => {
    beforeEach(() => {
      createStorageData({ shouldCreateStorageService: false });
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_NEW_STORAGE_SERVICE);
    });

    it('Verify add operation', () => {
      // Verify switching Manager to N/A and then selecting a value again does not break the form
      cy.getFormSelectFieldById({ selectId: 'ems_id' }).select(
        STORAGE_MANAGER_NAME
      );
      cy.getFormSelectFieldById({ selectId: 'compression' }).select(TRUE_VALUE);
      cy.getFormSelectFieldById({ selectId: 'ems_id' }).select(NA_VALUE);
      cy.getFormSelectFieldById({ selectId: 'ems_id' }).select(
        STORAGE_MANAGER_NAME
      );
      cy.getFormSelectFieldById({ selectId: 'compression' }).select(NA_VALUE);

      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(
        STORAGE_SERVICE_NAME
      );
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type(
        STORAGE_SERVICE_DESCRIPTION
      );
      // Verify add button is enabled when no capabilities are selected
      cy.getFormButtonByTypeWithText({
        buttonText: ADD_BUTTON_TEXT,
        buttonType: 'submit',
      }).should('be.enabled');
      cy.getFormSelectFieldById({ selectId: 'compression' }).select(TRUE_VALUE);
      // Ensure add button is disabled
      cy.getFormButtonByTypeWithText({
        buttonText: ADD_BUTTON_TEXT,
        buttonType: 'submit',
      }).should('be.disabled');
      cy.getFormSelectFieldById({ selectId: 'compression' }).select(TRUE_VALUE);
      cy.getFormSelectFieldById({ selectId: 'thin_provision' }).select(
        TRUE_VALUE
      );
      // Verify add button is disabled when compression is selected and no required
      // resource has been selected
      cy.getFormButtonByTypeWithText({
        buttonText: ADD_BUTTON_TEXT,
        buttonType: 'submit',
      }).should('be.disabled');
      cy.changeSelect('storage_resource_id', STORAGE_RESOURCE_1);
      // FIXME: Fix this from the support command
      // Close the multiselect by clicking outside of it
      cy.contains('h3', CAPABILITIES_SUB_HEADER).click();
      cy.getFormButtonByTypeWithText({
        buttonText: ADD_BUTTON_TEXT,
        buttonType: 'submit',
      }).click();
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_ADD);
    });
  });

  describe(`Verify delete action: ${TOOLBAR_CONFIGURATION} > ${TOOLBAR_DELETE_STORAGE_SERVICE}`, () => {
    beforeEach(() => {
      createStorageData({ shouldCreateStorageService: true });
    });

    it('Verify delete operation', () => {
      cy.selectTableRowsByText({ textArray: [STORAGE_SERVICE_NAME] });
      cy.expect_browser_confirm_with_text({
        confirmTriggerFn: () =>
          cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_DELETE_STORAGE_SERVICE),
      });
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_DELETE);
    });
  });

  describe(`Verify edit Form behavior: ${TOOLBAR_CONFIGURATION} > ${TOOLBAR_EDIT_STORAGE_SERVICE}`, () => {
    beforeEach(() => {
      createStorageData({ shouldCreateStorageService: true });
      cy.selectTableRowsByText({ textArray: [STORAGE_SERVICE_NAME] });
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_EDIT_STORAGE_SERVICE);
    });

    it('Verify edit operation', () => {
      cy.getFormSelectFieldById({ selectId: 'compression' }).select(TRUE_VALUE);
      // Ensure save button remains disabled while compliance check & resource selection are pending
      cy.getFormButtonByTypeWithText({
        buttonText: SAVE_BUTTON_TEXT,
        buttonType: 'submit',
      }).should('be.disabled');

      const taskResultsMockResponse = {
        state: 'Finished',
        status: 'Ok',
        task_results: {
          compliant_resources: [
            STORAGE_RESOURCE_1_EMS_REF,
            STORAGE_RESOURCE_2_EMS_REF,
            STORAGE_RESOURCE_3_EMS_REF,
          ],
        },
      };
      // Not using cy.interceptApi because it currently can't intercept multiple requests triggered by a single event
      cy.intercept(
        'GET',
        '/api/tasks/*?attributes=task_results',
        taskResultsMockResponse
      ).as('taskResultsApi');
      cy.intercept(
        'GET',
        '/api/storage_resources?expand=resources&attributes=id,name,ems_ref,capabilities'
      ).as('storageResourcesApi');
      cy.getFormButtonByTypeWithText({
        buttonText: CHECK_COMPILANCE_BUTTON_TEXT,
      }).click();
      cy.wait('@taskResultsApi');
      cy.wait('@storageResourcesApi');
      // Ensure save button remains disabled while resource selection is pending
      cy.getFormButtonByTypeWithText({
        buttonText: SAVE_BUTTON_TEXT,
        buttonType: 'submit',
      }).should('be.disabled');
      cy.contains('.ddorg__carbon-warning-helper-text', 'successful').should(
        'be.visible'
      );

      cy.changeSelect('storage_resource_id', STORAGE_RESOURCE_3);
      // FIXME: Fix this from the support command
      // Close the multiselect by clicking outside of it
      cy.contains('h3', CAPABILITIES_SUB_HEADER).click();
      cy.getFormButtonByTypeWithText({
        buttonText: SAVE_BUTTON_TEXT,
        buttonType: 'submit',
      }).click();
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_EDIT);
    });
  });
});
