import { flashClassMap } from '../../../../support/assertions/assertion_constants.js';
import {
  LABEL_CONFIG_KEYS,
  FIELD_CONFIG_KEYS,
  BUTTON_CONFIG_KEYS,
  FIELD_TYPES,
} from '../../../../support/commands/constants/command_constants.js';

// Menu options
const STORAGE_MENU_OPTION = 'Storage';
const STORAGE_SERVICES_MENU_OPTION = 'Storage Services';

// Toolbar options
const TOOLBAR_CONFIGURATION = 'Configuration';
const TOOLBAR_DELETE_STORAGE_SERVICE = 'Delete the Storage Service';
const TOOLBAR_ADD_NEW_STORAGE_SERVICE = 'Create a new storage service';
const TOOLBAR_EDIT_STORAGE_SERVICE = 'Edit selected Storage Service';

// Field labels
const FORM_HEADER = 'Storage Service';
const CAPABILITIES_SUB_HEADER = 'Required Capabilities';
const MANAGER_FIELD_LABEL = 'Storage Manager';
const NAME_FIELD_LABEL = 'Name';
const DESCRIPTION_FIELD_LABEL = 'Description';
const COMPRESSION_FIELD_LABEL = 'Compression';
const THIN_PROVISION_FIELD_LABEL = 'Thin provision';

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
const CANCEL_BUTTON_TEXT = 'Cancel';
const RESET_BUTTON_TEXT = 'Reset';

// Flash message text snippets
const FLASH_MESSAGE_ADD_CANCELLED = 'cancelled';
const FLASH_MESSAGE_EDIT_CANCELLED = 'canceled';
const FLASH_MESSAGE_ADD = 'add';
const FLASH_MESSAGE_DELETE = 'delete';
const FLASH_MESSAGE_RESET = 'reset';
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

function verifyFormElements({ isEdit = false }) {
  cy.contains('h1', FORM_HEADER).should('be.visible');
  cy.validateFormLabels([
    {
      [LABEL_CONFIG_KEYS.FOR_VALUE]: 'ems_id',
      [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: MANAGER_FIELD_LABEL,
    },
    {
      [LABEL_CONFIG_KEYS.FOR_VALUE]: 'name',
      [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: NAME_FIELD_LABEL,
    },
    {
      [LABEL_CONFIG_KEYS.FOR_VALUE]: 'description',
      [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: DESCRIPTION_FIELD_LABEL,
    },
  ]);
  cy.validateFormFields([
    {
      [FIELD_CONFIG_KEYS.ID]: 'ems_id',
      [FIELD_CONFIG_KEYS.FIELD_TYPE]: FIELD_TYPES.SELECT,
      [FIELD_CONFIG_KEYS.SHOULD_BE_DISABLED]: isEdit,
      ...(!isEdit && {
        [FIELD_CONFIG_KEYS.EXPECTED_VALUE]: NA_VALUE,
      }),
    },
    {
      [FIELD_CONFIG_KEYS.ID]: 'name',
    },
    {
      [FIELD_CONFIG_KEYS.ID]: 'description',
    },
  ]);
  cy.validateFormButtons([
    {
      [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: isEdit
        ? SAVE_BUTTON_TEXT
        : ADD_BUTTON_TEXT,
      [BUTTON_CONFIG_KEYS.BUTTON_TYPE]: 'submit',
      [BUTTON_CONFIG_KEYS.SHOULD_BE_DISABLED]: true,
    },
    {
      [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: CANCEL_BUTTON_TEXT,
    },
    ...(isEdit
      ? [
        {
          [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: RESET_BUTTON_TEXT,
          [BUTTON_CONFIG_KEYS.SHOULD_BE_DISABLED]: true,
        },
      ]
      : []),
  ]);

  if (!isEdit) {
    cy.getFormSelectFieldById({ selectId: 'ems_id' }).select(
      STORAGE_MANAGER_NAME
    );
  }
  cy.contains('h3', CAPABILITIES_SUB_HEADER).should('be.visible');
  cy.validateFormLabels([
    {
      [LABEL_CONFIG_KEYS.FOR_VALUE]: 'compression',
      [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: COMPRESSION_FIELD_LABEL,
    },
    {
      [LABEL_CONFIG_KEYS.FOR_VALUE]: 'thin_provision',
      [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: THIN_PROVISION_FIELD_LABEL,
    },
  ]);
  cy.validateFormFields([
    {
      [FIELD_CONFIG_KEYS.ID]: 'compression',
      [FIELD_CONFIG_KEYS.FIELD_TYPE]: FIELD_TYPES.SELECT,
      [FIELD_CONFIG_KEYS.EXPECTED_VALUE]: NA_VALUE,
    },
    {
      [FIELD_CONFIG_KEYS.ID]: 'thin_provision',
      [FIELD_CONFIG_KEYS.FIELD_TYPE]: FIELD_TYPES.SELECT,
      [FIELD_CONFIG_KEYS.EXPECTED_VALUE]: NA_VALUE,
    },
  ]);
  // Verify Storage Resource multi-select is not rendered when Compression is empty
  cy.get('#storage_resource_id button').should('not.exist');
  cy.getFormSelectFieldById({ selectId: 'compression' }).select(TRUE_VALUE);
  if (isEdit) {
    cy.getFormButtonByTypeWithText({
      buttonText: CHECK_COMPILANCE_BUTTON_TEXT,
    })
      .should('be.visible')
      .and('be.enabled');
  } else {
    cy.getFormButtonByTypeWithText({
      buttonText: CHECK_COMPILANCE_BUTTON_TEXT,
    }).should('not.be.visible');
  }
  // Verify Storage Resource multi-select is rendered & enabled when compression is non-empty
  cy.get('#storage_resource_id button').should('be.visible').and('be.enabled');
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

    it('Verify UI elements & cancel action', () => {
      verifyFormElements({ isEdit: false });
      cy.getFormButtonByTypeWithText({
        buttonText: CANCEL_BUTTON_TEXT,
      }).click();
      cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_ADD_CANCELLED);
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

      cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(
        STORAGE_SERVICE_NAME
      );
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type(
        STORAGE_SERVICE_DESCRIPTION
      );
      cy.getFormSelectFieldById({ selectId: 'compression' }).select(TRUE_VALUE);
      cy.getFormSelectFieldById({ selectId: 'thin_provision' }).select(
        TRUE_VALUE
      );
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

    it('Verify UI elements, reset & cancel actions', () => {
      verifyFormElements({ isEdit: true });
      // Edit any field
      cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type(
        STORAGE_SERVICE_DESCRIPTION
      );
      cy.getFormButtonByTypeWithText({
        buttonText: RESET_BUTTON_TEXT,
      }).click();
      cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_RESET);
      cy.getFormButtonByTypeWithText({
        buttonText: CANCEL_BUTTON_TEXT,
      }).click();
      cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_EDIT_CANCELLED);
    });

    it('Verify edit operation', () => {
      cy.getFormSelectFieldById({ selectId: 'compression' }).select(TRUE_VALUE);

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
      const storageResourcesMockResponse = {
        resources: [
          { name: STORAGE_RESOURCE_1, ems_ref: STORAGE_RESOURCE_1_EMS_REF },
          { name: STORAGE_RESOURCE_2, ems_ref: STORAGE_RESOURCE_2_EMS_REF },
          { name: STORAGE_RESOURCE_3, ems_ref: STORAGE_RESOURCE_3_EMS_REF },
        ],
      };
      // Not using cy.interceptApi because it currently can't intercept multiple requests triggered by a single event
      cy.intercept(
        'GET',
        '/api/tasks/*?attributes=task_results',
        taskResultsMockResponse
      ).as('taskResultsApi');
      cy.intercept(
        'GET',
        '/api/storage_resources?expand=resources&attributes=name,ems_ref',
        storageResourcesMockResponse
      ).as('storageResourcesApi');
      cy.getFormButtonByTypeWithText({
        buttonText: CHECK_COMPILANCE_BUTTON_TEXT,
      }).click();
      cy.wait('@taskResultsApi');
      cy.wait('@storageResourcesApi');
      cy.get('.ddorg__carbon-warning-helper-text')
        .should('contain.text', STORAGE_RESOURCE_1)
        .and('contain.text', STORAGE_RESOURCE_2)
        .and('contain.text', STORAGE_RESOURCE_3)
        .and('be.visible');

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

  describe('Verify duplicate storage service creation behavior', () => {
    beforeEach(() => {
      createStorageData({ shouldCreateStorageService: true });
      cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_NEW_STORAGE_SERVICE);
    });

    it('Verify duplicate storage service creation is restricted', () => {
      // Focus out of the input after typing to trigger the inline validation error
      cy.getFormInputFieldByIdAndType({ inputId: 'name' })
        .type(STORAGE_SERVICE_NAME)
        .blur();
      cy.expect_inline_field_errors({ containsText: 'already exists' });
    });
  });
});
