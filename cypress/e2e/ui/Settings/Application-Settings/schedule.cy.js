/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';

// Component route url
const COMPONENT_ROUTE_URL = '/ops/explorer';

// List items
const SCHEDULES_ACCORDION_ITEM = 'Schedules';
const MANAGEIQ_REGION_ACCORDION_ITEM = /^ManageIQ Region:/;

// Field values
const INITIAL_SCHEDULE_NAME = 'Test-name';
const EDITED_SCHEDULE_NAME = 'Dummy-name';
const INITIAL_DESCRIPTION = 'Test description';
const EDITED_DESCRIPTION = 'Dummy description';
const ACTION_TYPE_VM_ANALYSIS = 'vm';
const ACTION_TYPE_TEMPLATE_ANALYSIS = 'miq_template';
const ACTION_TYPE_HOST_ANALYSIS = 'host';
const ACTION_TYPE_CONTAINER_ANALYSIS = 'container_image';
const ACTION_TYPE_CLUSTER_ANALYSIS = 'emscluster';
const ACTION_TYPE_DATA_STORE_ANALYSIS = 'storage';
const ACTION_TYPE_VM_COMPILANCE_CHECK = 'vm_check_compliance';
const ACTION_TYPE_HOST_COMPILANCE_CHECK = 'host_check_compliance';
const ACTION_TYPE_CONTAINER_COMPILANCE_CHECK =
  'container_image_check_compliance';
const ACTION_TYPE_AUTOMATION_TASKS = 'automation_request';
const TIMER_TYPE_ONCE = 'Once';
const TIMER_TYPE_HOURLY = 'Hourly';
const TIMER_TYPE_DAILY = 'Daily';
const TIMER_TYPE_WEEKLY = 'Weekly';
const TIMER_TYPE_MONTHLY = 'Monthly';
const FREQUENCY_TYPE_HOUR = '1 Hour';
const TIMEZONE_TYPE_HAWAII = '(GMT-10:00) Hawaii';
const INITIAL_START_DATE = '06/30/2025';
const EDITED_START_DATE = '07/21/2025';
const START_TIME = '11:23';

// Buttons
const SAVE_BUTTON_TEXT = 'Save';
const CANCEL_BUTTON_TEXT = 'Cancel';
const RESET_BUTTON_TEXT = 'Reset';

// Config options
const CONFIG_TOOLBAR_BUTTON = 'Configuration';
const ADD_SCHEDULE_CONFIG_OPTION = 'Add a new Schedule';
const DELETE_SCHEDULE_CONFIG_OPTION = 'Delete this Schedule from the Database';
const EDIT_SCHEDULE_CONFIG_OPTION = 'Edit this Schedule';
const DISABLE_SCHEDULE_CONFIG_OPTION = 'Disable this Schedule';
const ENABLE_SCHEDULE_CONFIG_OPTION = 'Enable this Schedule';
const QUEUE_SCHEDULE_CONFIG_OPTION = 'Queue up this Schedule to run now';

// Menu options
const SETTINGS_OPTION = 'Settings';
const APP_SETTINGS_OPTION = 'Application Settings';

// Flash message text snippets
const FLASH_MESSAGE_SCHEDULE_QUEUED = 'queued';
const FLASH_MESSAGE_OPERATION_CANCELED = 'cancel';
const FLASH_MESSAGE_SCHEDULE_DISABLED = 'disabled';
const FLASH_MESSAGE_SCHEDULE_ENABLED = 'enabled';
const FLASH_MESSAGE_SCHEDULE_SAVED = 'saved';
const FLASH_MESSAGE_RESET_SCHEDULE = 'reset';
const FLASH_MESSAGE_SCHEDULE_DELETED = 'delete';
const FLASH_MESSAGE_FAILED_TO_ADD_SCHEDULE = 'failed';

// Browser alert text snippets
const BROWSER_ALERT_DELETE_CONFIRM_TEXT = 'removed';

function selectConfigMenu(menuOption) {
  return cy.toolbar(CONFIG_TOOLBAR_BUTTON, menuOption);
}

function addSchedule() {
  // Open add schedule form
  selectConfigMenu(ADD_SCHEDULE_CONFIG_OPTION);
  // Checks if Save button is disabled initially
  cy.contains(
    '#main-content .bx--btn-set button[type="submit"]',
    saveButton
  ).should('be.disabled');
  // Adding data
  cy.get('input#name').type(initialScheduleName);
  cy.get('input#description').type(initialDescription);
  cy.get('input[type="checkbox"]#enabled').check({ force: true });
  // Select Action type option: 'VM Analysis'
  cy.get('select#action_typ').select(actionTypeVmAnalysis);
  // Select Filter type option: 'A Single VM'
  cy.get('select#filter_typ').select(actionTypeVmAnalysis);
  // Select Run option: 'Hours'
  cy.get('select#timer_typ').select(timerTypeHourly);
  // Select Every option: '1 Hour'
  cy.get('select#timer_value').select(frequencyTypeHour);
  // Select Time zone option: '(GMT-10:00) Hawaii'
  cy.get('input[role="combobox"]#time_zone').click();
  cy.contains('[role="option"]', timezoneTypeHawaii)
    .should('be.visible')
    .click();
  cy.get('input#start_date').type(initialStartDate);
  cy.get('input#start_time').type(startTime);
  // Intercepting the API call for adding a new schedule
  cy.interceptApi({
    alias: 'addScheduleApi',
    urlPattern: '/ops/schedule_edit/new?button=save',
    triggerFn: () =>
      cy.contains('#main-content .bx--btn-set button[type="submit"]', saveButton)
        .should('be.enabled') // Checks if Save button is enabled once all required fields are filled
        .click(),
  });
}

function clickScheduleItem(scheduleName) {
  // TODO: Replace with cy.interceptApi after it's enhanced to wait conditionally on request trigger
  // Flag to check if the request is fired
  let requestFired = false;
  // Intercepting the API call
  cy.intercept(
    {
      method: 'POST',
      pathname: '/ops/tree_select',
      query: { text: scheduleName },
    },
    // This callback function will be called when the request is fired,
    // from which the requestFired flag will be set to true
    () => (requestFired = true)
  ).as('getCreatedScheduleApi');
  // Triggering the action that will fire the API call,
  // which is selecting the created schedule
  cy.accordionItem(scheduleName);
  // Wait for the API call to complete if it was fired
  // This is to ensure that the test does not fail if the request was not fired
  cy.then(() => {
    // If the request was fired, wait for the alias
    if (requestFired) {
      cy.wait('@getCreatedScheduleApi');
    }
  });
}

function deleteSchedule(scheduleName) {
  // Selecting the schedule and intercepting the API call to get schedule details
  clickScheduleItem(scheduleName);
  // Listening for the browser confirm alert and confirming deletion
  cy.expect_browser_confirm_with_text({
    confirmTriggerFn: () => selectConfigMenu(DELETE_SCHEDULE_CONFIG_OPTION),
    containsText: BROWSER_ALERT_DELETE_CONFIRM_TEXT,
  });
  cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SCHEDULE_DELETED);
}

function invokeCleanupDeletion() {
  // Iterate and clean up any leftover schedules created during the test
  cy.get('div.panel-collapse.collapse.in li.list-group-item').each((item) => {
    const text = item?.text()?.trim();
    if (text === INITIAL_SCHEDULE_NAME) {
      deleteSchedule(INITIAL_SCHEDULE_NAME);
      return false;
    }
    if (text === EDITED_SCHEDULE_NAME) {
      deleteSchedule(EDITED_SCHEDULE_NAME);
      return false; // exit iteration
    }
    return null; // has no impact, just to get rid of eslint warning
  });
}

describe('Automate Schedule form operations: Settings > Application Settings > Settings > Schedules > Configuration > Add a new schedule', () => {
  beforeEach(() => {
    cy.login();
    // Navigate to Application-Settings
    cy.menu(SETTINGS_OPTION, APP_SETTINGS_OPTION);
    // Expand Settings accordion panel
    cy.accordion(SETTINGS_OPTION);
    // Select Schedules accordion item
    cy.interceptApi({
      alias: 'treeSelectApi',
      urlPattern: /\/ops\/tree_select\?id=.*&text=.*/,
      triggerFn: () =>
        cy.selectAccordionItem([
          MANAGEIQ_REGION_ACCORDION_ITEM,
          SCHEDULES_ACCORDION_ITEM,
        ]),
    });
  });

  it('Validate visibility of elements based on dropdown selections', () => {
    // Open add schedule form
    selectConfigMenu(ADD_SCHEDULE_CONFIG_OPTION);

    /* ===== Selecting any option other than "Automation Tasks" from "Action" dropdown does not hide the Filter dropdown ===== */

    cy.get('select#action_typ').select(actionTypeVmAnalysis);
    cy.get('select#action_typ').should('have.value', actionTypeVmAnalysis);
    // Checking for Filter type dropdown
    verifyFilterTypeDropdownExists();

    cy.get('select#action_typ').select(actionTypeTemplateAnalysis);
    cy.get('select#action_typ').should(
      'have.value',
      actionTypeTemplateAnalysis
    );
    // Checking for Filter type dropdown
    verifyFilterTypeDropdownExists();

    cy.get('select#action_typ').select(actionTypeHostAnalysis);
    cy.get('select#action_typ').should('have.value', actionTypeHostAnalysis);
    // Checking for Filter type dropdown
    verifyFilterTypeDropdownExists();

    cy.get('select#action_typ').select(actionTypeContainerAnalysis);
    cy.get('select#action_typ').should(
      'have.value',
      actionTypeContainerAnalysis
    );
    // Checking for Filter type dropdown
    verifyFilterTypeDropdownExists();

    cy.get('select#action_typ').select(actionTypeClusterAnalysis);
    cy.get('select#action_typ').should('have.value', actionTypeClusterAnalysis);
    // Checking for Filter type dropdown
    verifyFilterTypeDropdownExists();

    cy.get('select#action_typ').select(actionTypeDataStoreAnalysis);
    cy.get('select#action_typ').should(
      'have.value',
      actionTypeDataStoreAnalysis
    );
    // Checking for Filter type dropdown
    verifyFilterTypeDropdownExists();

    cy.get('select#action_typ').select(actionTypeVmCompilanceCheck);
    cy.get('select#action_typ').should(
      'have.value',
      actionTypeVmCompilanceCheck
    );
    // Checking for Filter type dropdown
    verifyFilterTypeDropdownExists();

    cy.get('select#action_typ').select(actionTypeHostCompilanceCheck);
    cy.get('select#action_typ').should(
      'have.value',
      actionTypeHostCompilanceCheck
    );
    // Checking for Filter type dropdown
    verifyFilterTypeDropdownExists();

    cy.get('select#action_typ').select(actionTypeContainerCompilanceCheck);
    cy.get('select#action_typ').should(
      'have.value',
      actionTypeContainerCompilanceCheck
    );
    // Checking for Filter type dropdown
    verifyFilterTypeDropdownExists();

    /* ===== Selecting "Automation Tasks" option from "Action" dropdown shows Zone, Object details & Object fields ===== */

    cy.get('select#action_typ').select(actionTypeAutomationTasks);
    cy.get('select#action_typ').should('have.value', actionTypeAutomationTasks);

    // Checking for Zone dropdown
    cy.get('label[for="zone_id"]').should('exist');
    cy.get('select#zone_id').should('exist');

    // Checking for Object Details
    cy.get('h3[name="object_details"]').should('exist');
    // Checking for System/Process dropdown
    cy.get('label[for="instance_name"]').should('exist');
    cy.get('select#instance_name').should('exist');
    // Checking for Messsage textfield
    cy.get('label[for="message"]').should('exist');
    cy.get('input#message').should('exist');
    // Checking for Request textfield
    cy.get('label[for="request"]').should('exist');
    cy.get('input#request').should('exist');

    // Checking for Object
    cy.get('h3[name="object_attributes"]').should('exist');
    // Checking for Type Combobox
    cy.get('label[for="target_class"]').should('exist');
    cy.get('input[role="combobox"]#target_class').should('exist');
    // Checking for Object Combobox
    cy.get('label[for="target_id"]').should('exist');
    cy.get('input[role="combobox"]#target_id').should('exist');

    // Checking for Attribute/Value pairs
    cy.contains('h3', 'Attribute/Value Pairs').should('exist');
    // Checking for 5 attribute-value pairs text fields
    cy.get('input#attribute_1').should('exist');
    cy.get('input#value_1').should('exist');
    cy.get('input#attribute_2').should('exist');
    cy.get('input#value_2').should('exist');
    cy.get('input#attribute_3').should('exist');
    cy.get('input#value_3').should('exist');
    cy.get('input#attribute_4').should('exist');
    cy.get('input#value_4').should('exist');
    cy.get('input#attribute_5').should('exist');
    cy.get('input#value_5').should('exist');

    /* ===== Selecting "Once" option from "Run" dropdown does not show the "Every" dropdown ===== */

    cy.get('select#timer_typ').select(timerTypeOnce);
    // Checking whether the Every dropdown is hidden
    cy.get('input#timer_value').should('not.exist');

    /* ===== Selecting any other option other than "Once" from "Run" dropdown shows the "Every" dropdown ===== */

    cy.get('select#timer_typ').select(timerTypeHourly);
    // Checking whether the "Every" dropdown exist
    verifyTimerDropdownExists();

    cy.get('select#timer_typ').select(timerTypeDaily);
    // Checking whether the "Every" dropdown exist
    verifyTimerDropdownExists();

    cy.get('select#timer_typ').select(timerTypeWeekly);
    // Checking whether the "Every" dropdown exist
    verifyTimerDropdownExists();

    cy.get('select#timer_typ').select(timerTypeMonthly);
    // Checking whether the "Every" dropdown exist
    verifyTimerDropdownExists();
  });

  it('Checking whether Cancel button works on the Add form', () => {
    // Open add schedule form
    selectConfigMenu(ADD_SCHEDULE_CONFIG_OPTION);
    // Cancel the form
    cy.contains(
      '#main-content .bx--btn-set button[type="button"]',
      cancelButton
    )
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_CANCELED);
  });

  it('Checking whether add, edit & delete schedule works', () => {
    /* ===== Adding a schedule ===== */
    addSchedule();
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SCHEDULE_SAVED);

    /* ===== Editing a schedule ===== */
    // Selecting the schedule and intercepting the API call to get schedule details
    clickScheduleItem(INITIAL_SCHEDULE_NAME);
    // Open edit schedule form
    selectConfigMenu(EDIT_SCHEDULE_CONFIG_OPTION);
    // Editing name and description
    cy.get('input#name').clear().type(editedScheduleName);
    cy.get('input#description').clear().type(editedDescription);
    // Confirms Save button is enabled after making edits
    cy.contains('#main-content .bx--btn-set button[type="submit"]', saveButton)
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SCHEDULE_SAVED);

    /* ===== Delete is already handled from afterEach hook ===== */
  });

  it('Checking whether Cancel & Reset buttons work fine in the Edit form', () => {
    /* ===== Adding a schedule ===== */
    addSchedule();

    /* ===== Checking whether Reset button works ===== */
    // Selecting the schedule and intercepting the API call to get schedule details
    clickScheduleItem(INITIAL_SCHEDULE_NAME);
    // Open edit schedule form
    selectConfigMenu(EDIT_SCHEDULE_CONFIG_OPTION);
    // Editing description and start date
    cy.get('input#description').clear().type(editedDescription);
    cy.get('input#start_date').clear().type(editedStartDate);
    cy.contains('#main-content .bx--btn-set button[type="button"]', resetButton)
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_RESET_SCHEDULE);
    // Confirming the edited fields contain the old values after resetting
    cy.get('input#description').should('have.value', initialDescription);
    cy.get('input#start_date').should('have.value', initialStartDate);

    /* ===== Checking whether Cancel button works ===== */
    cy.contains('#main-content .bx--btn-set button[type="button"]', CANCEL_BUTTON_TEXT)
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_OPERATION_CANCELED);
  });

  it('Checking whether creating a duplicate record is restricted', () => {
    /* ===== Adding schedule ===== */
    addSchedule();

    /* ===== Trying to add the same schedule again ===== */
    addSchedule();
    cy.expect_flash(flashClassMap.error, FLASH_MESSAGE_FAILED_TO_ADD_SCHEDULE);
  });

  it('Checking whether Disabling, Enabling & Queueing up the schedule works', () => {
    /* ===== Adding a schedule ===== */
    addSchedule();
    // Selecting the schedule and intercepting the API call to get schedule details
    clickScheduleItem(INITIAL_SCHEDULE_NAME);

    /* ===== Disabling the schedule ===== */
    selectConfigMenu(DISABLE_SCHEDULE_CONFIG_OPTION);
    cy.expect_flash(flashClassMap.info, FLASH_MESSAGE_SCHEDULE_DISABLED);

    /* ===== Enabling the schedule ===== */
    selectConfigMenu(ENABLE_SCHEDULE_CONFIG_OPTION);
    cy.expect_flash(flashClassMap.info, FLASH_MESSAGE_SCHEDULE_ENABLED);

    /* ===== Queueing-up the schedule ===== */
    selectConfigMenu(QUEUE_SCHEDULE_CONFIG_OPTION);
    cy.expect_flash(flashClassMap.success, FLASH_MESSAGE_SCHEDULE_QUEUED);
  });

  afterEach(() => {
    cy.url()
      ?.then((url) => {
        // Ensures navigation to Settings -> Application-Settings in the UI
        if (!url?.includes(COMPONENT_ROUTE_URL)) {
          // Navigate to Settings -> Application-Settings before looking out for Schedules created during test
          cy.menu(SETTINGS_OPTION, APP_SETTINGS_OPTION);
        }
      })
      .then(() => {
        invokeCleanupDeletion();
      });
  });
});
