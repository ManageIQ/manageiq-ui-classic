/* eslint-disable no-undef */
// TODO: Use aliased import(@cypress-dir) once #9631 is merged
import { flashClassMap } from '../../../../support/assertions/assertion_constants';
import {
  LABEL_CONFIG_KEYS,
  FIELD_CONFIG_KEYS,
  BUTTON_CONFIG_KEYS,
} from '../../../../support/commands/constants/command_constants';

// Menu options
const SETTINGS_MENU_OPTION = 'Settings';
const APP_SETTINGS_MENU_OPTION = 'Application Settings';

// List items
const DIAGNOSTICS_ACCORDION_ITEM = 'Diagnostics';
const MANAGEIQ_REGION_ACCORD_ITEM = /^ManageIQ Region:/;
const ZONE_ACCORD_ITEM = /^Zone:/;

// Field values
const TIMEZONE_FIELD_LABEL = 'Timezone';
const START_DATE_FIELD_LABEL = 'Start Date';
const END_DATE_FIELD_LABEL = 'End Date';
const FORM_HEADER = 'Diagnostics Zone';
const FORM_SUBHEADER_SNIPPET = 'Collection Options';
const TIMEZONE_TYPE_HAWAII = '(GMT-10:00) Hawaii';
const START_DATE_INDEX = '10';
const END_DATE_INDEX = '15';

// Flash message text snippets
const FLASH_MESSAGE_GAP_COLLECTION_INITIATED = 'initiated';
const FLASH_MESSAGE_DATE_RANGE_INVALID = 'cannot';

// TODO: Add a support command for calendar date selection
function selectDate(inputId, dateIndex) {
  cy.getFormInputFieldByIdAndType({ inputId }).click();
  cy.get('.flatpickr-calendar.open .cds--date-picker__day').eq(dateIndex).click();
}

function fillGapCollectionForm(startDateIndex, endDateIndex) {
  // Select "Hawaii" from timezone dropdown
  cy.getFormLabelByForAttribute({ forValue: 'timezone' }).click();
  cy.contains('[role="option"]', TIMEZONE_TYPE_HAWAII).click();
  // Add start date
  selectDate('startDate', startDateIndex);
  // Click elsewhere to close the start date calendar popup
  cy.get('h3').contains(FORM_SUBHEADER_SNIPPET).click();
  // Add end date
  selectDate('endDate', endDateIndex);
  // Click elsewhere to close the end date calendar popup
  cy.get('h3').contains(FORM_SUBHEADER_SNIPPET).click();
}

function saveFormAndAssertFlashMessage(flashMessageType, flashMessage) {
  cy.interceptApi({
    alias: 'saveGapCollectionApi',
    urlPattern: '/ops/cu_repair?button=submit',
    triggerFn: () =>
      cy
        .getFormButtonByTypeWithText({
          buttonText: 'Save',
          buttonType: 'submit',
        })
        .click(),
    onApiResponse: () => cy.expect_flash(flashMessageType, flashMessage),
  });
}

describe('Automate C & U Gap Collection form operations: Settings > Application Settings > Diagnostics > ManageIQ Region > Zone Default Zone > C & U Gap Collection', () => {
  beforeEach(() => {
    cy.login();
    // Navigate to Application settings and expand Diagnostics accordion
    cy.menu(SETTINGS_MENU_OPTION, APP_SETTINGS_MENU_OPTION);
    cy.accordion(DIAGNOSTICS_ACCORDION_ITEM);
    // Select "Zone:" accordion item
    cy.selectAccordionItem([MANAGEIQ_REGION_ACCORD_ITEM, ZONE_ACCORD_ITEM]);
    // Select "C & U Gap Collection" tab
    cy.tabs({ tabLabel: 'C & U Gap Collection' });
  });

  it('Validate form elements', () => {
    // Assert form header is visible
    cy.expect_explorer_title(FORM_HEADER).should('be.visible');
    // Assert form sub-header is visible
    cy.contains('#main-content .cds--form h3', FORM_SUBHEADER_SNIPPET).should(
      'be.visible'
    );

    // Validate form labels
    cy.validateFormLabels([
      {
        [LABEL_CONFIG_KEYS.FOR_VALUE]: 'timezone',
        [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: TIMEZONE_FIELD_LABEL,
      },
      {
        [LABEL_CONFIG_KEYS.FOR_VALUE]: 'startDate',
        [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: START_DATE_FIELD_LABEL,
      },
      {
        [LABEL_CONFIG_KEYS.FOR_VALUE]: 'endDate',
        [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: END_DATE_FIELD_LABEL,
      },
    ]);
    // Validate form fields
    cy.validateFormFields([
      {
        [FIELD_CONFIG_KEYS.ID]: 'timezone',
        [FIELD_CONFIG_KEYS.EXPECTED_VALUE]: '(GMT+00:00) UTC',
      },
      { [FIELD_CONFIG_KEYS.ID]: 'startDate' },
      { [FIELD_CONFIG_KEYS.ID]: 'endDate' },
    ]);
    // Validate form footer buttons
    cy.validateFormButtons([
      {
        [BUTTON_CONFIG_KEYS.BUTTON_TEXT]: 'Save',
        [BUTTON_CONFIG_KEYS.BUTTON_TYPE]: 'submit',
        [BUTTON_CONFIG_KEYS.SHOULD_BE_DISABLED]: true,
      },
    ]);
  });

  it('Should fail if start date is greater than end date', () => {
    // Fill the form with end date less than start date
    fillGapCollectionForm(END_DATE_INDEX, START_DATE_INDEX);
    // Save form and assert flash error message
    saveFormAndAssertFlashMessage(
      flashClassMap.error,
      FLASH_MESSAGE_DATE_RANGE_INVALID
    );
  });

  it('Validate gap collection initiation', () => {
    // Fill the form
    fillGapCollectionForm(START_DATE_INDEX, END_DATE_INDEX);
    // Save form and assert flash success message
    saveFormAndAssertFlashMessage(
      flashClassMap.success,
      FLASH_MESSAGE_GAP_COLLECTION_INITIATED
    );
  });
});
