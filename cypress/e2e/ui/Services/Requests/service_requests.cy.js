/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';
import {
  LABEL_CONFIG_KEYS,
  FIELD_CONFIG_KEYS,
  FIELD_TYPES,
  BUTTON_CONFIG_KEYS,
} from '../../../../support/commands/constants/command_constants';

// Menu options
const SERVICES_MENU_OPTION = 'Services';
const REQUESTS_MENU_OPTION = 'Requests';
const CATALOGS_MENU_OPTION = 'Catalogs';
const AUTOMATION_MENU_OPTION = 'Automation';
const EMBEDDED_AUTOMATION_MENU_OPTION = 'Embedded Automate';
const CUSTOMIZATION_MENU_OPTION = 'Customization';

// Accordion items
const SERVICE_DIALOGS_ACCORDION = 'Service Dialogs';
const ALL_DIALOGS_ACCORDION_ITEM = 'All Dialogs';
const SERVICE_CATALOGS_ACCORDION = 'Service Catalogs';
const ALL_SERVICES_ACCORDION_ITEM = 'All Services';
const CATALOG_ITEMS_ACCORDION_ITEM = 'Catalog Items';
const ALL_CATALOG_ITEMS_ACCORDION_ITEM = 'All Catalog Items';

// Toolbar options
const TOOLBAR_CONFIGURATION = 'Configuration';
const TOOLBAR_ADD_NEW_DIALOG = 'Add a new Dialog';
const TOOLBAR_ADD_CATALOG_ITEM = 'Add a New Catalog Item';

// Field labels
const FORM_HEADER = 'Requests';
const REQUESTER_LABEL = 'Requester';
const APPROVAL_STATE_HEADER = 'Approval State';
const TYPE_LABEL = 'Type';
const REQUEST_DATE_LABEL = 'Request Date';
const REASON_LABEL = 'Reason';

// Field values
const TEST_DIALOG_NAME = 'Test-Dialog-Name';
const CATALOG_ITEM_NAME = 'Test-Catalog-Item';
const SELECT_OPTION_ALL = 'all';
const TYPE_VM_PROVISION = 'VM Provision';
const REQUEST_DATE_LAST_7_DAYS = '7';

// Checkbox labels
const PENDING_APPROVAL_LABEL = 'Pending Approval';
const APPROVED_LABEL = 'Approved';
const DENIED_LABEL = 'Denied';

// Button texts
const APPLY_BUTTON_TEXT = 'Apply';
const RESET_BUTTON_TEXT = 'Reset';
const SAVE_BUTTON_TEXT = 'Save';
const ADD_BUTTON_TEXT = 'Add';
const ORDER_BUTTON_TEXT = 'Order';
const SUBMIT_BUTTON_TEXT = 'Submit';

// Flash message text snippets
const FLASH_MESSAGE_ADD_SUCCESS = 'added';
const FLASH_MESSAGE_SAVE_SUCCESS = 'saved';
const FLASH_MESSAGE_SUBMITTED = 'submitted';

function dataSetup() {
  // Adding a dialog
  cy.menu(
    AUTOMATION_MENU_OPTION,
    EMBEDDED_AUTOMATION_MENU_OPTION,
    CUSTOMIZATION_MENU_OPTION
  );
  cy.accordion(SERVICE_DIALOGS_ACCORDION);
  cy.selectAccordionItem([ALL_DIALOGS_ACCORDION_ITEM]);
  cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_NEW_DIALOG);
  cy.contains('ul.static-field-list li.static-field-item', 'Text Box').trigger(
    'mousedown',
    { which: 1 }
  );
  cy.get('.well-lg').trigger('mousemove').trigger('mouseup', { force: true });
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(TEST_DIALOG_NAME);
  cy.interceptApi({
    urlPattern: '/api/service_dialogs',
    alias: 'addDialogApi',
    triggerFn: () =>
      cy
        .contains('.pull-right button', SAVE_BUTTON_TEXT)
        .should('be.enabled')
        .click(),
    onApiResponse: (interception) =>
      expect(interception.response.statusCode).to.equal(200),
  });
  cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SAVE_SUCCESS);
  // Adding a catalog item
  cy.menu(SERVICES_MENU_OPTION, CATALOGS_MENU_OPTION);
  cy.accordion(CATALOG_ITEMS_ACCORDION_ITEM);
  cy.selectAccordionItem([ALL_CATALOG_ITEMS_ACCORDION_ITEM]);
  cy.toolbar(TOOLBAR_CONFIGURATION, TOOLBAR_ADD_CATALOG_ITEM);
  cy.contains('.form-group button[data-id="st_prov_type"]', 'Choose').click();
  cy.interceptApi({
    urlPattern: '/catalog/atomic_form_field_changed/new?st_prov_type=generic',
    alias: 'getGenericCatalogItemTypeDetailsApi',
    triggerFn: () =>
      cy.contains('.form-group ul.dropdown-menu li a', 'Generic').click(),
    onApiResponse: (interception) =>
      expect(interception.response.statusCode).to.equal(200),
  });
  cy.get('input#name').type(CATALOG_ITEM_NAME);
  cy.contains('.form-group button[data-id="catalog_id"]', 'Unassigned').click();
  cy.contains(
    '.form-group ul.dropdown-menu li a',
    'My Company/My Catalog'
  ).click();
  cy.contains('.form-group button[data-id="dialog_id"]', 'No Dialog').click();
  cy.contains(' .form-group ul.dropdown-menu li a', TEST_DIALOG_NAME).click();
  cy.get('input#display').check();
  cy.interceptApi({
    urlPattern: '/catalog/servicetemplate_edit?button=add',
    alias: 'addCatalogItemApi',
    triggerFn: () =>
      cy.contains('#form_buttons_div button', ADD_BUTTON_TEXT).click(),
    onApiResponse: (interception) =>
      expect(interception.response.statusCode).to.equal(200),
  });
  cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_ADD_SUCCESS);
  // Order
  cy.accordion(SERVICE_CATALOGS_ACCORDION);
  cy.selectAccordionItem([ALL_SERVICES_ACCORDION_ITEM]);
  // TODO: Replace with clickTableRowByText once #9691 is merged
  cy.contains('.miq-data-table table tbody tr td', CATALOG_ITEM_NAME).click();
  // cy.clickTableRowByText({ text: CATALOG_ITEM_NAME, columnIndex: 1 });
  cy.interceptApi({
    urlPattern: /\/catalog\/x_button\/\d+\?pressed=svc_catalog_provision/,
    alias: 'orderApi',
    triggerFn: () =>
      cy
        .contains(`#main-content button[type="button"]`, ORDER_BUTTON_TEXT)
        .click(),
    onApiResponse: (interception) =>
      expect(interception.response.statusCode).to.equal(200),
  });
  cy.interceptApi({
    urlPattern: /\/api\/service_catalogs\/\d+\/service_templates\/\d+$/,
    alias: 'submitOrderApi',
    triggerFn: () =>
      cy.contains('.pull-right button', SUBMIT_BUTTON_TEXT).click(),
    onApiResponse: (interception) =>
      expect(interception.response.statusCode).to.equal(200),
  });
  cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SUBMITTED);
}

describe('Automate Service Requests form operations: Services > Requests', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Verify form fields', () => {
    beforeEach(() => {
      cy.menu(SERVICES_MENU_OPTION, REQUESTS_MENU_OPTION);
    });

    it('Verify form’s initial UI state', () => {
      cy.contains('#main-content h1', FORM_HEADER);
      cy.getFormLegendByText({ legendText: APPROVAL_STATE_HEADER });
      cy.validateFormLabels([
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'selectedUser',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: REQUESTER_LABEL,
        },
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'types',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: TYPE_LABEL,
        },
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'selectedPeriod',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: REQUEST_DATE_LABEL,
        },
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'reasonText',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: REASON_LABEL,
        },
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'approvalStates-pending_approval',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: PENDING_APPROVAL_LABEL,
        },
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'approvalStates-approved',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: APPROVED_LABEL,
        },
        {
          [LABEL_CONFIG_KEYS.FOR_VALUE]: 'approvalStates-denied',
          [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: DENIED_LABEL,
        },
      ]);
      cy.validateFormFields([
        {
          [FIELD_CONFIG_KEYS.ID]: 'selectedUser',
          [FIELD_CONFIG_KEYS.FIELD_TYPE]: FIELD_TYPES.SELECT,
          [FIELD_CONFIG_KEYS.EXPECTED_VALUE]: SELECT_OPTION_ALL,
        },
        {
          [FIELD_CONFIG_KEYS.ID]: 'approvalStates-pending_approval',
          [FIELD_CONFIG_KEYS.INPUT_FIELD_TYPE]: 'checkbox',
          [FIELD_CONFIG_KEYS.SHOULD_BE_CHECKED]: true,
        },
        {
          [FIELD_CONFIG_KEYS.ID]: 'approvalStates-approved',
          [FIELD_CONFIG_KEYS.INPUT_FIELD_TYPE]: 'checkbox',
          [FIELD_CONFIG_KEYS.SHOULD_BE_CHECKED]: true,
        },
        {
          [FIELD_CONFIG_KEYS.ID]: 'approvalStates-denied',
          [FIELD_CONFIG_KEYS.INPUT_FIELD_TYPE]: 'checkbox',
          [FIELD_CONFIG_KEYS.SHOULD_BE_CHECKED]: true,
        },
        {
          [FIELD_CONFIG_KEYS.ID]: 'types',
          [FIELD_CONFIG_KEYS.FIELD_TYPE]: FIELD_TYPES.SELECT,
          [FIELD_CONFIG_KEYS.EXPECTED_VALUE]: SELECT_OPTION_ALL,
        },
        {
          [FIELD_CONFIG_KEYS.ID]: 'selectedPeriod',
          [FIELD_CONFIG_KEYS.FIELD_TYPE]: FIELD_TYPES.SELECT,
          [FIELD_CONFIG_KEYS.EXPECTED_VALUE]: REQUEST_DATE_LAST_7_DAYS,
        },
        {
          [FIELD_CONFIG_KEYS.ID]: 'reasonText',
        },
      ]);
      cy.validateFormFooterButtons([
        {
          [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: APPLY_BUTTON_TEXT,
          [BUTTON_CONFIG_KEYS.BUTTON_TYPE]: 'submit',
          [BUTTON_CONFIG_KEYS.BUTTON_WRAPPER_CLASS]: 'custom-button-wrapper',
        },
        {
          [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: RESET_BUTTON_TEXT,
          [BUTTON_CONFIG_KEYS.BUTTON_WRAPPER_CLASS]: 'custom-button-wrapper',
        },
      ]);
      // TODO: Replace with verify_gtl_no_records_text once #9691 is merged
      cy.contains('#miq-gtl-view .no-records-found', 'No records found');
      // cy.verify_gtl_no_records_text();
    });
  });

  describe('Validate button click actions', () => {
    beforeEach(() => {
      // TODO: Replace with better setup approach
      dataSetup();
    });

    it('Validate reset & apply buttons', () => {
      /* Reset */
      cy.getFormSelectFieldById({ selectId: 'selectedUser' }).select(
        'Administrator'
      );
      cy.getFormLabelByForAttribute({
        forValue: 'approvalStates-pending_approval',
      }).click();
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-pending_approval',
        inputType: 'checkbox',
      }).should('not.be.checked');
      cy.getFormLabelByForAttribute({
        forValue: 'approvalStates-approved',
      }).click();
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-approved',
        inputType: 'checkbox',
      }).should('not.be.checked');
      cy.getFormLabelByForAttribute({
        forValue: 'approvalStates-denied',
      }).click();
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-denied',
        inputType: 'checkbox',
      }).should('not.be.checked');
      cy.getFormSelectFieldById({ selectId: 'types' }).select(
        TYPE_VM_PROVISION
      );
      cy.getFormSelectFieldById({ selectId: 'selectedPeriod' }).select(
        'Last 30 Days'
      );
      cy.getFormInputFieldByIdAndType({ inputId: 'reasonText' }).type(
        'Testing'
      );
      cy.getFormFooterButtonByTypeWithText({
        buttonText: RESET_BUTTON_TEXT,
        buttonWrapperClass: 'custom-button-wrapper',
      }).click();
      cy.getFormSelectFieldById({ selectId: 'selectedUser' }).should(
        'have.value',
        SELECT_OPTION_ALL
      );
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-pending_approval',
        inputType: 'checkbox',
      }).should('be.checked');
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-approved',
        inputType: 'checkbox',
      }).should('be.checked');
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-denied',
        inputType: 'checkbox',
      }).should('be.checked');
      cy.getFormSelectFieldById({ selectId: 'types' }).should(
        'have.value',
        SELECT_OPTION_ALL
      );
      cy.getFormSelectFieldById({ selectId: 'selectedPeriod' }).should(
        'have.value',
        REQUEST_DATE_LAST_7_DAYS
      );
      cy.getFormInputFieldByIdAndType({ inputId: 'reasonText' }).should(
        'have.value',
        ''
      );
      /* Apply */
      // Filter data with approval state
      cy.getFormLabelByForAttribute({
        forValue: 'approvalStates-pending_approval',
      }).click();
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-pending_approval',
        inputType: 'checkbox',
      }).should('not.be.checked');
      cy.getFormLabelByForAttribute({
        forValue: 'approvalStates-approved',
      }).click();
      cy.getFormInputFieldByIdAndType({
        inputId: 'approvalStates-approved',
        inputType: 'checkbox',
      }).should('not.be.checked');
      cy.getFormFooterButtonByTypeWithText({
        buttonText: APPLY_BUTTON_TEXT,
        buttonWrapperClass: 'custom-button-wrapper',
        buttonType: 'submit',
      }).click();
      // TODO: Replace with verify_gtl_no_records_text once #9691 is merged
      cy.contains('#miq-gtl-view .no-records-found', 'No records found');
      // cy.verify_gtl_no_records_text();
      cy.getFormFooterButtonByTypeWithText({
        buttonText: RESET_BUTTON_TEXT,
        buttonWrapperClass: 'custom-button-wrapper',
      }).click();
      cy.gtlGetRows([0]).then((data) => {
        expect(data.length).to.equal(1);
      });
      // Filter data with type
      cy.getFormSelectFieldById({ selectId: 'types' }).select(
        TYPE_VM_PROVISION
      );
      cy.getFormFooterButtonByTypeWithText({
        buttonText: APPLY_BUTTON_TEXT,
        buttonWrapperClass: 'custom-button-wrapper',
        buttonType: 'submit',
      }).click();
      // TODO: Replace with verify_gtl_no_records_text once #9691 is merged
      cy.contains('#miq-gtl-view .no-records-found', 'No records found');
      // cy.verify_gtl_no_records_text();
      cy.getFormFooterButtonByTypeWithText({
        buttonText: RESET_BUTTON_TEXT,
        buttonWrapperClass: 'custom-button-wrapper',
      }).click();
      cy.gtlGetRows([0]).then((data) => {
        expect(data.length).to.equal(1);
      });
      // Filter data with
      cy.getFormInputFieldByIdAndType({ inputId: 'reasonText' }).type('r@ndOm');
      cy.getFormFooterButtonByTypeWithText({
        buttonText: APPLY_BUTTON_TEXT,
        buttonWrapperClass: 'custom-button-wrapper',
        buttonType: 'submit',
      }).click();
      // TODO: Replace with verify_gtl_no_records_text once #9691 is merged
      cy.contains('#miq-gtl-view .no-records-found', 'No records found');
      // cy.verify_gtl_no_records_text();
      cy.getFormFooterButtonByTypeWithText({
        buttonText: RESET_BUTTON_TEXT,
        buttonWrapperClass: 'custom-button-wrapper',
      }).click();
      cy.gtlGetRows([0]).then((data) => {
        expect(data.length).to.equal(1);
      });
    });

    afterEach(() => {
      cy.appDbState('restore');
    });
  });
});
