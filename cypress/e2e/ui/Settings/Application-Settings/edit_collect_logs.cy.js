/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';

// Component route url
const COMPONENT_ROUTE_URL = '/ops/explorer';

// Menu options
const SETTINGS_MENU_OPTION = 'Settings';
const APP_SETTINGS_MENU_OPTION = 'Application Settings';

// List items
const DIAGNOSTICS_ACCORDION_ITEM = 'Diagnostics';
const DIAGNOSTICS_ACCORDION_ITEM_ID = 'diagnostics_accord';
const MANAGEIQ_REGION_ACCORDION_ITEM = /^ManageIQ Region:/;
const ZONE_ACCORDION_ITEM = /^Zone:/;
const SERVER_ACCORDION_ITEM = /^Server:/;

// Field values
const FORM_HEADER = 'Editing Log Depot settings';
const FORM_SUBHEADER_SNIPPET = 'Editing Log Depot Settings';

// Config options
const EDIT_TOOLBAR_BUTTON = 'Edit';

// Buttons
const SAVE_BUTTON_TEXT = 'Save';
const CANCEL_BUTTON_TEXT = 'Cancel';
const RESET_BUTTON_TEXT = 'Reset';

// Dropdown values
const DROPDOWN_BLANK_VALUE = 'BLANK_VALUE';
const SAMBA_DROPDOWN_VALUE = 'FileDepotSmb';

// Flash message text snippets
const FLASH_MESSAGE_SETTINGS_SAVED = 'saved';
const FLASH_MESSAGE_OPERATION_CANCELLED = 'cancel';

function goToCollectLogsTab() {
  cy.interceptApi({
    alias: 'getCollectLogsTabInfo',
    urlPattern: '/ops/change_tab?tab_id=diagnostics_collect_logs',
    triggerFn: () =>
      cy
        .get(
          '#tab_all_tabs_div #ops_tabs .nav-tabs li#diagnostics_collect_logs_tab'
        )
        .click(),
  });
}

function selectToolbarEditButton() {
  cy.interceptApi({
    alias: 'editEventForServer',
    // This pattern matches both /ops/x_button/1?pressed=log_depot_edit & /ops/x_button/2?pressed=zone_log_depot_edit endpoints
    urlPattern: /\/ops\/x_button\/[^/]+\?pressed=.*log_depot_edit/,
    triggerFn: () => cy.toolbar(EDIT_TOOLBAR_BUTTON),
  });
}

function resetProtocolDropdown({ selectServerListItem = true } = {}) {
  // Select Diagnostics
  cy.accordion(DIAGNOSTICS_ACCORDION_ITEM);
  // Select "Zone:" or "Server:" accordion item
  cy.selectAccordionItem([
    MANAGEIQ_REGION_ACCORDION_ITEM,
    ZONE_ACCORDION_ITEM,
    ...(selectServerListItem ? [SERVER_ACCORDION_ITEM] : []),
  ]);

  // Clicking Edit button
  selectToolbarEditButton();

  // Resetting Protocol dropdown value
  cy.getFormSelectFieldById('log_protocol').then((selectField) => {
    const currentValue = selectField.val();
    // If the value is not default one(BLANK_VALUE), then setting it to blank
    if (currentValue !== DROPDOWN_BLANK_VALUE) {
      cy.wrap(selectField).select(DROPDOWN_BLANK_VALUE);
      cy.getFormFooterButtonByType(SAVE_BUTTON_TEXT, 'submit').click();
      // Validating confirmation flash message
      cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SETTINGS_SAVED);
    }
  });
}

function goToCollectLogsTabAndOpenEditForm() {
  // Selecting Collect Logs tab
  goToCollectLogsTab();
  // Clicking Edit button
  selectToolbarEditButton();
}

function validateFormElements() {
  // Assert form header is visible
  cy.expect_explorer_title(FORM_HEADER).should('be.visible');
  // Assert form sub-header is visible
  cy.contains('#main-content .bx--form h3', FORM_SUBHEADER_SNIPPET).should(
    'be.visible'
  );
  // Assert protocol field label is visible
  cy.getFormLabelByInputId('log_protocol').should('be.visible');
  // Assert protocol field is visible and enabled
  cy.getFormSelectFieldById('log_protocol')
    .should('be.visible')
    .and('be.enabled');
  // Assert cancel button is visible and enabled
  cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT)
    .should('be.visible')
    .and('be.enabled');
  // Assert save button is visible and disabled
  cy.getFormFooterButtonByType(SAVE_BUTTON_TEXT, 'submit')
    .should('be.visible')
    .and('be.disabled');
  // Assert reset button is visible and disabled
  cy.getFormFooterButtonByType(RESET_BUTTON_TEXT)
    .should('be.visible')
    .and('be.disabled');
}

function cancelButtonValidation() {
  // Click cancel button in the form
  cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT).click();
  // Validating confirmation flash message
  cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_CANCELLED);
}

function resetButtonValidation() {
  // Selecting Samba option from dropdown
  cy.getFormSelectFieldById('log_protocol').select(SAMBA_DROPDOWN_VALUE);
  // Confirm Reset button is enabled once dropdown value is changed and then click on Reset
  cy.getFormFooterButtonByType(RESET_BUTTON_TEXT).should('be.enabled').click();
  // Confirm dropdown has the old value
  cy.getFormSelectFieldById('log_protocol').should(
    'have.value',
    DROPDOWN_BLANK_VALUE
  );
}

function saveButtonValidation() {
  // Selecting Samba option from dropdown
  cy.getFormSelectFieldById('log_protocol').select(SAMBA_DROPDOWN_VALUE);
  // Confirm Save button is enabled once dropdown value is changed and then click on Save
  cy.getFormFooterButtonByType(SAVE_BUTTON_TEXT, 'submit')
    .should('be.enabled')
    .click();
  // Validating confirmation flash message
  cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SETTINGS_SAVED);
}

describe('Automate Collect logs Edit form operations', () => {
  beforeEach(() => {
    cy.login();
    // Navigate to Application settings and expand Diagnostics accordion
    cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
    cy.interceptApi({
      alias: 'getDiagnosticsInfo',
      urlPattern: `/ops/accordion_select?id=${DIAGNOSTICS_ACCORDION_ITEM_ID}`,
      triggerFn: () => cy.accordion(DIAGNOSTICS_ACCORDION_ITEM),
    });
  });

  describe('Settings > Application Settings > Diagnostics > Manage IQ Region > Zone > Server > Collect logs > Edit', () => {
    beforeEach(() => {
      // Select "Server:" accordion item
      cy.selectAccordionItem([
        MANAGEIQ_REGION_ACCORDION_ITEM,
        ZONE_ACCORDION_ITEM,
        SERVER_ACCORDION_ITEM,
      ]);
      // Select collect logs navbar and open edit form
      goToCollectLogsTabAndOpenEditForm();
    });

    it('Validate form elements', () => {
      validateFormElements();
    });

    it('Validate Reset & Cancel buttons', () => {
      // Reset button validation
      resetButtonValidation();
      // Cancel button validation
      cancelButtonValidation();
    });

    it('Validate Save button', () => {
      saveButtonValidation();
    });

    after(() => {
      cy.url()
        ?.then((url) => {
          // Ensures navigation to Settings -> Application-Settings in the UI
          if (!url?.includes(COMPONENT_ROUTE_URL)) {
            // Navigate to Settings -> Application-Settings before cleanup
            cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
          }
        })
        .then(() => {
          resetProtocolDropdown();
        });
    });
  });

  describe('Settings > Application Settings > Diagnostics > Manage IQ Region > Zone > Collect logs > Edit', () => {
    beforeEach(() => {
      // Select "Zone:" accordion item
      cy.interceptApi({
        alias: 'treeSelectApi',
        urlPattern:
          /ops\/tree_select\?id=.*&text=.*Zone.*Default.*Zone.*(current).*/,
        triggerFn: () =>
          cy.selectAccordionItem([
            MANAGEIQ_REGION_ACCORDION_ITEM,
            ZONE_ACCORDION_ITEM,
          ]),
      });
      // Select collect logs tab and open edit form
      goToCollectLogsTabAndOpenEditForm();
    });

    it('Validate form elements', () => {
      validateFormElements();
    });

    it('Validate Reset & Cancel buttons', () => {
      // Reset button validation
      resetButtonValidation();
      // Cancel button validation
      cancelButtonValidation();
    });

    it('Validate Save button', () => {
      saveButtonValidation();
    });

    after(() => {
      cy.url()
        ?.then((url) => {
          // Ensures navigation to Settings -> Application-Settings in the UI
          if (!url?.includes(COMPONENT_ROUTE_URL)) {
            // Navigate to Settings -> Application-Settings before cleanup
            cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
          }
        })
        .then(() => {
          resetProtocolDropdown({ selectServerListItem: false });
        });
    });
  });
});
