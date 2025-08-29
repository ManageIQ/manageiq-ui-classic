/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';

// Component route url
const COMPONENT_ROUTE_URL = '/ops/explorer#/';

// Menu options
const SETTINGS_LABEL = 'Settings';
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
const NAME_FIELD_LABEL = 'Name';
const DESCRIPTION_FIELD_LABEL = 'Description';
const SERVER_IP_FIELD_LABEL = 'Server IP';
const MAX_SCAN_FIELD_LABEL = 'VM Scans';
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
  cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_ZONE_CONFIG_OPTION);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' }).type(ZONE_NAME);
  cy.getFormInputFieldByIdAndType({ inputId: 'description' }).type(
    INITIAL_ZONE_DESCRIPTION
  );
  cy.getFormInputFieldByIdAndType({ inputId: 'settings.proxy_server_ip' }).type(
    INITIAL_SERVER_IP
  );
  cy.getFormSelectFieldById({
    selectId: 'settings.concurrent_vm_scans',
  }).select(INITIAL_MAX_SCAN_LIMIT);
  cy.interceptApi({
    alias: 'createZoneApi',
    urlPattern: '/api/zones',
    triggerFn: () =>
      cy
        .getFormFooterButtonByTypeWithText({
          buttonText: ADD_BUTTON_TEXT,
          buttonType: 'submit',
        })
        .should('be.enabled')
        .click(),
  });
  return cy.then(() => {
    return `Zone: ${INITIAL_ZONE_DESCRIPTION}`;
  });
}

function validateFormElements(isEditForm = false) {
  cy.expect_explorer_title(FORM_HEADER_FRAGMENT);
  cy.get('#main-content .bx--form h3').contains(INFO_SUB_HEADER);
  cy.getFormLabelByForAttribute({ forValue: 'name' })
    .should('be.visible')
    .and('contain.text', NAME_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'name' })
    .should('be.visible')
    .then((nameField) => {
      if (isEditForm) {
        expect(nameField).to.be.disabled;
      } else {
        expect(nameField).to.not.be.disabled;
      }
    });
  cy.getFormLabelByForAttribute({ forValue: 'description' })
    .should('be.visible')
    .and('contain.text', DESCRIPTION_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'description' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormLabelByForAttribute({ forValue: 'settings.proxy_server_ip' })
    .should('be.visible')
    .and('contain.text', SERVER_IP_FIELD_LABEL);
  cy.getFormInputFieldByIdAndType({ inputId: 'settings.proxy_server_ip' })
    .should('be.visible')
    .and('be.enabled');
  cy.get('#main-content .bx--form h3').contains(SETTINGS_SUB_HEADER);
  cy.getFormLabelByForAttribute({ forValue: 'settings.concurrent_vm_scans' })
    .should('be.visible')
    .and('contain.text', MAX_SCAN_FIELD_LABEL);
  cy.getFormSelectFieldById({ selectId: 'settings.concurrent_vm_scans' })
    .should('be.visible')
    .and('be.enabled');
  cy.getFormFooterButtonByTypeWithText({ buttonText: CANCEL_BUTTON_TEXT })
    .should('be.visible')
    .and('be.enabled');
  if (isEditForm) {
    cy.getFormFooterButtonByTypeWithText({ buttonText: RESET_BUTTON_TEXT })
      .should('be.visible')
      .and('be.disabled');
  }
  cy.getFormFooterButtonByTypeWithText({
    buttonText: isEditForm ? SAVE_BUTTON_TEXT : ADD_BUTTON_TEXT,
    buttonType: 'submit',
  })
    .should('be.visible')
    .and('be.disabled');
}

function cleanUp() {
  cy.get('li.list-group-item').each((item) => {
    const text = item.text().trim();
    if (text.includes(INITIAL_ZONE_DESCRIPTION)) {
      if (!item.hasClass('node-selected')) {
        cy.wrap(item).click();
      }
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
  cy.selectAccordionItem([
    MANAGEIQ_REGION_ACCORDION_ITEM,
    ZONES_ACCORDION_ITEM,
    ...(childZoneNode ? [childZoneNode] : []),
  ]);
}

describe('Automate Zone form operations: Settings > Application Settings > Settings > Zones > Configuration > Add a new Zone', () => {
  beforeEach(() => {
    cy.login();
    cy.menu(SETTINGS_LABEL, APP_SETTINGS_OPTION);
    cy.accordion(SETTINGS_LABEL);
    selectZoneAccordionItem();
  });

  it('Validate the visibility and state of add form elements', () => {
    cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_ZONE_CONFIG_OPTION);
    validateFormElements();
  });

  it('Checking whether cancel button works on the add form', () => {
    cy.toolbar(CONFIG_TOOLBAR_BUTTON, ADD_ZONE_CONFIG_OPTION);
    cy.getFormFooterButtonByTypeWithText({
      buttonText: CANCEL_BUTTON_TEXT,
    }).click();
    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_OPERATION_CANCELED);
  });

  it('Checking whether add, edit & delete zone works', () => {
    /* ===== Add ===== */
    addZone().then((createdZone) => {
      // Here the createdZone will have value "Zone: Test-Zone-Description",
      // which is the accordion item to be selected
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_ZONE_UPDATED);
      selectZoneAccordionItem(createdZone);
    });
    /* ===== Edit ===== */
    cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_ZONE_CONFIG_OPTION);
    cy.getFormInputFieldByIdAndType({ inputId: 'description' })
      .clear()
      .type(UPDATED_SERVER_IP);
    cy.getFormSelectFieldById({
      selectId: 'settings.concurrent_vm_scans',
    }).select(UPDATED_MAX_SCAN_LIMIT);
    cy.getFormFooterButtonByTypeWithText({
      buttonText: SAVE_BUTTON_TEXT,
      buttonType: 'submit',
    })
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_ZONE_UPDATED);
    /* ===== Delete ===== */
    cy.expect_browser_confirm_with_text({
      confirmTriggerFn: () =>
        cy.toolbar(CONFIG_TOOLBAR_BUTTON, DELETE_ZONE_CONFIG_OPTION),
      containsText: DELETE_CONFIRM_TEXT,
    });
    cy.expect_flash(flashClassMap.success, DELETE_CONFIRM_TEXT);
  });

  it('Validate the visibility and state of edit form elements', () => {
    addZone().then((createdZone) => {
      // Here the createdZone will have value "Zone: Test-Zone-Description",
      // which is the accordion item to be selected
      selectZoneAccordionItem(createdZone);
    });
    cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_ZONE_CONFIG_OPTION);
    validateFormElements(true);
    cy.getFormFooterButtonByTypeWithText({
      buttonText: CANCEL_BUTTON_TEXT,
    }).click();
  });

  it('Checking whether cancel & reset buttons work on the edit form', () => {
    addZone().then((createdZone) => {
      // Here the createdZone will have value "Zone: Test-Zone-Description",
      // which is the accordion item to be selected
      selectZoneAccordionItem(createdZone);
    });
    cy.toolbar(CONFIG_TOOLBAR_BUTTON, EDIT_ZONE_CONFIG_OPTION);
    /* ===== Reset ===== */
    cy.getFormInputFieldByIdAndType({ inputId: 'description' })
      .clear()
      .type(UPDATED_ZONE_DESCRIPTION);
    cy.getFormInputFieldByIdAndType({ inputId: 'settings.proxy_server_ip' })
      .clear()
      .type(UPDATED_SERVER_IP);
    cy.getFormFooterButtonByTypeWithText({ buttonText: RESET_BUTTON_TEXT })
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_OPERATION_RESET);
    cy.getFormInputFieldByIdAndType({ inputId: 'description' }).should(
      'have.value',
      INITIAL_ZONE_DESCRIPTION
    );
    cy.getFormInputFieldByIdAndType({
      inputId: 'settings.proxy_server_ip',
    }).should('have.value', INITIAL_SERVER_IP);
    /* ===== Cancel ===== */
    cy.getFormFooterButtonByTypeWithText({
      buttonText: CANCEL_BUTTON_TEXT,
    }).click();
    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_OPERATION_CANCELED);
  });

  afterEach(() => {
    cy.url()
      .then((url) => {
        // Ensures navigation to Settings -> Application-Settings in the UI
        if (!url.endsWith(COMPONENT_ROUTE_URL)) {
          cy.visit(COMPONENT_ROUTE_URL);
        }
        cy.accordion(SETTINGS_LABEL);
      })
      .then(() => {
        cleanUp();
      });
  });
});
