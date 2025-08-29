/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';

// Component route url
const COMPONENT_ROUTE_URL = '/ops/explorer';

// Menu options
const SETTINGS_OPTION = 'Settings';
const APP_SETTINGS_OPTION = 'Application Settings';

// Accordion items
const MANAGEIQ_REGION_ACCORDION_ITEM = /^ManageIQ Region:/;
const ZONES_ACCORDION_ITEM = 'Zones';

// Config options
const CONFIG_TOOLBAR_BUTTON = 'Configuration';
const ADD_ZONE_CONFIG_OPTION = 'Add a new Zone';
const EDIT_ZONE_CONFIG_OPTION = 'Edit this Zone';
const DELETE_ZONE_CONFIG_OPTION = 'Delete this Zone';

// Field values
const FORM_HEADER_FRAGMENT = 'Zone';
const INFO_SUB_HEADER = 'Info';
const SETTINGS_SUB_HEADER = 'Settings';
const ZONE_NAME = 'Test-Zone-Name';
const INITIAL_ZONE_DESCRIPTION = 'Test-Zone-Description';
const UPDATED_ZONE_DESCRIPTION = 'Test-Zone-Description-Updated';
const INITIAL_SERVER_IP = '0.0.0.0';
const UPDATED_SERVER_IP = '1.1.1.1';
const INITIAL_MAX_SCAN_LIMIT = 5;
const UPDATED_MAX_SCAN_LIMIT = 10;

// Element ids
const IP_INPUT_FIELD_ID = 'settings\\.proxy_server_ip';
const MAX_SCAN_SELECT_FIELD_ID = 'settings\\.concurrent_vm_scans';

// Buttons
const SAVE_BUTTON_TEXT = 'Save';
const CANCEL_BUTTON_TEXT = 'Cancel';
const ADD_BUTTON_TEXT = 'Add';
const RESET_BUTTON_TEXT = 'Reset';

// Flash message text snippets
const FLASH_MESSAGE_OPERATION_CANCELED = 'cancel';
const FLASH_MESSAGE_ZONE_UPDATED = 'queued';
const FLASH_MESSAGE_OPERATION_RESET = 'reset';
const DELETE_CONFIRM_TEXT = 'delete';

function addZone() {
  // Open add form
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_ZONE_CONFIG_OPTION);
  // Adding name, description, ip and scan limit
  cy.getFormInputFieldById('name').type(ZONE_NAME);
  cy.getFormInputFieldById('description').type(INITIAL_ZONE_DESCRIPTION);
  cy.getFormInputFieldById(IP_INPUT_FIELD_ID).type(INITIAL_SERVER_IP);
  cy.getFormSelectFieldById(MAX_SCAN_SELECT_FIELD_ID).select(
    INITIAL_MAX_SCAN_LIMIT
  );
  cy.interceptApi({
    alias: 'createZoneApi',
    urlPattern: '/api/zones',
    triggerFn: () =>
      cy
        .getFormFooterButtonByType(ADD_BUTTON_TEXT, 'submit')
        .should('be.enabled')
        .click(),
  });
  return cy.then(() => {
    return `Zone: ${INITIAL_ZONE_DESCRIPTION}`;
  });
}

function validateFormElements(isEditForm = false) {
  // Assert form header is visible
  cy.expect_explorer_title(FORM_HEADER_FRAGMENT);
  // Assert Info sub header is visible
  cy.get('#main-content .bx--form h3').contains(INFO_SUB_HEADER);
  // Assert name field label is visible
  cy.getFormLabelByInputId('name').should('be.visible');
  // Assert name field is visible and enabled
  cy.getFormInputFieldById('name')
    .should('be.visible')
    .then((nameField) => {
      if (isEditForm) {
        expect(nameField).to.be.disabled;
      } else {
        expect(nameField).to.not.be.disabled;
      }
    });
  // Assert description field label is visible
  cy.getFormLabelByInputId('description').should('be.visible');
  // Assert description field is visible and enabled
  cy.getFormInputFieldById('description')
    .should('be.visible')
    .and('be.enabled');
  // Assert IP field label is visible
  cy.getFormLabelByInputId(IP_INPUT_FIELD_ID).should('be.visible');
  // Assert IP field is visible and enabled
  cy.getFormInputFieldById(IP_INPUT_FIELD_ID)
    .should('be.visible')
    .and('be.enabled');
  // Assert Settings sub header is visible
  cy.get('#main-content .bx--form h3').contains(SETTINGS_SUB_HEADER);
  // Assert max scan field label is visible
  cy.getFormLabelByInputId(MAX_SCAN_SELECT_FIELD_ID).should('be.visible');
  // Assert max scan field is visible and enabled
  cy.getFormSelectFieldById(MAX_SCAN_SELECT_FIELD_ID)
    .should('be.visible')
    .and('be.enabled');
  // Assert cancel button is visible and enabled
  cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT)
    .should('be.visible')
    .and('be.enabled');
  if (isEditForm) {
    // Assert reset button is visible and disabled
    cy.getFormFooterButtonByType(RESET_BUTTON_TEXT)
      .should('be.visible')
      .and('be.disabled');
  }
  // Assert add/save button is visible and disabled
  cy.getFormFooterButtonByType(
    isEditForm ? SAVE_BUTTON_TEXT : ADD_BUTTON_TEXT,
    'submit'
  )
    .should('be.visible')
    .and('be.disabled');
}

function cleanUp() {
  cy.get('li.list-group-item').each((item) => {
    const text = item?.text()?.trim();
    if (text.includes(INITIAL_ZONE_DESCRIPTION)) {
      // Select the zone node if it hasn't been selected yet
      if (!item.hasClass('node-selected')) {
        cy.wrap(item).click();
        cy.wait('@treeSelectApi');
      }
      // Deleting the zone
      cy.expect_browser_confirm_with_text({
        confirmTriggerFn: () =>
          cy.toolbar(CONFIG_TOOLBAR_BUTTON, DELETE_ZONE_CONFIG_OPTION),
      });
      return false; // exit the iteration
    }
    return null; // has no impact - just to get rid of eslint warning
  });
}

function selectZoneAccordionItem(childZoneNode) {
  cy.interceptApi({
    alias: 'treeSelectApi',
    urlPattern: /\/ops\/tree_select\?id=.*&text=.*/,
    triggerFn: () =>
      cy.selectAccordionItem([
        MANAGEIQ_REGION_ACCORDION_ITEM,
        ZONES_ACCORDION_ITEM,
        ...(childZoneNode ? [childZoneNode] : []),
      ]),
  });
}

describe('Automate Schedule form operations: Settings > Application Settings > Settings > Zones > Configuration > Add a new Zone', () => {
  beforeEach(() => {
    cy.login();
    // Navigate to Application-Settings
    cy.menu(SETTINGS_OPTION, APP_SETTINGS_OPTION);
    // Expand Settings accordion panel if not already expanded
    cy.accordion(SETTINGS_OPTION);
    // Select "Zones" accordion item
    selectZoneAccordionItem();
  });

  it('Validate the visibility and state of add form elements', () => {
    // Open add form
    cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_ZONE_CONFIG_OPTION);
    // Validate fields
    validateFormElements();
  });

  it('Checking whether cancel button works on the add form', () => {
    // Open add form
    cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_ZONE_CONFIG_OPTION);
    // Cancelling the form
    cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT).click();
    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_OPERATION_CANCELED);
  });

  it('Checking whether add, edit & delete zone works', () => {
    /* ===== Add ===== */
    // Adding zone
    addZone().then((createdZone) => {
      // Here the createdZone will have value "Zone: Test-Zone-Description",
      // which is the accordion item to be selected
      // Assert flash message
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_ZONE_UPDATED);
      // Select the created zone
      selectZoneAccordionItem(createdZone);
    });
    /* ===== Edit ===== */
    // Open edit form
    cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_ZONE_CONFIG_OPTION);
    // Update IP & scan limit
    cy.getFormInputFieldById('description').clear().type(UPDATED_SERVER_IP);
    cy.getFormSelectFieldById(MAX_SCAN_SELECT_FIELD_ID).select(
      UPDATED_MAX_SCAN_LIMIT
    );
    // Save the form
    cy.getFormFooterButtonByType(SAVE_BUTTON_TEXT, 'submit')
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_ZONE_UPDATED);
    /* ===== Delete ===== */
    // Deleting the zone
    cy.expect_browser_confirm_with_text({
      confirmTriggerFn: () =>
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, DELETE_ZONE_CONFIG_OPTION),
      containsText: DELETE_CONFIRM_TEXT,
    });
    cy.expect_flash(flashClassMap.success, DELETE_CONFIRM_TEXT);
  });

  it('Validate the visibility and state of edit form elements', () => {
    // Adding zone
    addZone().then((createdZone) => {
      // Here the createdZone will have value "Zone: Test-Zone-Description",
      // which is the accordion item to be selected
      // Select the created zone
      selectZoneAccordionItem(createdZone);
    });
    // Open edit form
    cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_ZONE_CONFIG_OPTION);
    // Validate fields
    validateFormElements(true);
    // Cancelling the form
    cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT).click();
  });

  it('Checking whether cancel & reset buttons work on the edit form', () => {
    // Adding zone
    addZone().then((createdZone) => {
      // Here the createdZone will have value "Zone: Test-Zone-Description",
      // which is the accordion item to be selected
      // Select the created zone
      selectZoneAccordionItem(createdZone);
    });
    // Open edit form
    cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_ZONE_CONFIG_OPTION);
    /* ===== Reset ===== */
    // Update description & IP
    cy.getFormInputFieldById('description')
      .clear()
      .type(UPDATED_ZONE_DESCRIPTION);
    cy.getFormInputFieldById(IP_INPUT_FIELD_ID).clear().type(UPDATED_SERVER_IP);
    // Resetting the form
    cy.getFormFooterButtonByType(RESET_BUTTON_TEXT)
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_OPERATION_RESET);
    // Confirming the edited fields contain the old values after resetting
    cy.getFormInputFieldById('description').should(
      'have.value',
      INITIAL_ZONE_DESCRIPTION
    );
    cy.getFormInputFieldById(IP_INPUT_FIELD_ID).should(
      'have.value',
      INITIAL_SERVER_IP
    );
    /* ===== Cancel ===== */
    // Cancelling the form
    cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT).click();
    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_OPERATION_CANCELED);
  });

  afterEach(() => {
    cy.url()
      ?.then((url) => {
        // Ensures navigation to Settings -> Application-Settings in the UI
        if (!url?.includes(COMPONENT_ROUTE_URL)) {
          // Navigate to Settings -> Application-Settings before cleanup
          cy.menu(SETTINGS_OPTION, APP_SETTINGS_OPTION);
        }
      })
      .then(() => {
        cleanUp();
      });
  });
});
