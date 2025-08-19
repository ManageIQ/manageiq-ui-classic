/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';

// Menu options
const SETTINGS_MENU_OPTION = 'Settings';
const APP_SETTINGS_MENU_OPTION = 'Application Settings';

// List items
const DIAGNOSTICS_ACCORDION_ITEM = 'Diagnostics';
const MANAGEIQ_REGION_ACCORD_ITEM = /^ManageIQ Region:/;
const ZONE_ACCORD_ITEM = /^Zone:/;

// Field values
const FORM_HEADER = 'Diagnostics Zone';
const FORM_SUBHEADER_SNIPPET = 'Collection Options';
const TIMEZONE_TYPE_HAWAII = '(GMT-10:00) Hawaii';
const START_DATE = '06/25/2026';
const END_DATE = '06/28/2026';

// Buttons
const SAVE_BUTTON_TEXT = 'Save';

// Flash message text snippets
const FLASH_MESSAGE_GAP_COLLECTION_INITIATED = 'initiated';
const FLASH_MESSAGE_DATE_RANGE_INVALID = 'cannot';

function fillGapCollectionForm(startDateValue, endDateValue) {
  // Select "Hawaii" from timezone dropdown
  cy.getFormLabelByInputId('timezone').click();
  cy.contains('[role="option"]', TIMEZONE_TYPE_HAWAII)
    .should('be.visible')
    .click();
  // Add start date
  cy.getFormInputFieldById('startDate').type(startDateValue);
  // Add end date
  cy.getFormInputFieldById('endDate').type(endDateValue, {
    force: true,
  });
}

function saveFormAndAssertFlashMessage(flashMessageType, flashMessage) {
  cy.interceptApi({
    alias: 'saveGapCollectionApi',
    urlPattern: '/ops/cu_repair?button=submit',
    triggerFn: () =>
      cy
        .getFormFooterButtonByType(SAVE_BUTTON_TEXT, 'submit')
        .click({ force: true }),
    onApiResponse: () => cy.expect_flash(flashMessageType, flashMessage),
  });
}

describe('Automate C & U Gap Collection form operations: Settings > Application Settings > Diagnostics > ManageIQ Region > Zone Default Zone > C & U Gap Collection', () => {
  beforeEach(() => {
    cy.login();
    // Navigate to Application settings and expand Diagnostics accordion
    cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
    cy.interceptApi({
      alias: 'accordionSelectApi',
      urlPattern: /\/ops\/accordion_select\?id=.*/,
      triggerFn: () => cy.accordion(DIAGNOSTICS_ACCORDION_ITEM),
    });
    // Select "Zone:" accordion item
    cy.interceptApi({
      alias: 'treeSelectApi',
      urlPattern: /\/ops\/tree_select\?id=.*&text=.*/,
      triggerFn: () =>
        cy.selectAccordionItem([MANAGEIQ_REGION_ACCORD_ITEM, ZONE_ACCORD_ITEM]),
    });
    // Select "C & U Gap Collection" tab
    cy.get(
      '#tab_all_tabs_div #ops_tabs .nav-tabs li#diagnostics_cu_repair_tab'
    ).click();
  });

  it('Validate form elements', () => {
    // Assert form header is visible
    cy.expect_explorer_title(FORM_HEADER).should('be.visible');
    // Assert form sub-header is visible
    cy.contains('#main-content .bx--form h3', FORM_SUBHEADER_SNIPPET).should(
      'be.visible'
    );
    // Assert timezone label & field is visible and enabled
    cy.getFormLabelByInputId('timezone').should('be.visible');
    cy.getFormInputFieldById('timezone').should('be.visible').and('be.enabled');
    // Assert start date label & field is visible and enabled
    cy.getFormLabelByInputId('startDate').should('be.visible');
    cy.getFormInputFieldById('startDate')
      .should('be.visible')
      .and('be.enabled');
    // Assert end date label & field is visible and enabled
    cy.getFormLabelByInputId('endDate').should('be.visible');
    cy.getFormInputFieldById('endDate').should('be.visible').and('be.enabled');
    // Assert save button is visible and disabled
    cy.getFormFooterButtonByType(SAVE_BUTTON_TEXT, 'submit')
      .should('be.visible')
      .and('be.disabled');
  });

  it('Should fail if start date is greater than end date', () => {
    // Fill the form with end date less than start date
    fillGapCollectionForm(END_DATE, START_DATE);
    // Save form and assert flash error message
    saveFormAndAssertFlashMessage(
      flashClassMap.error,
      FLASH_MESSAGE_DATE_RANGE_INVALID
    );
  });

  it('Validate gap collection initiation', () => {
    // Fill the form
    fillGapCollectionForm(START_DATE, END_DATE);
    // Save form and assert flash success message
    saveFormAndAssertFlashMessage(
      flashClassMap.success,
      FLASH_MESSAGE_GAP_COLLECTION_INITIATED
    );
  });
});
