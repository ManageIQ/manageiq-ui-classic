/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';

// Component route url
const COMPONENT_ROUTE_URL = '/ops/explorer';

// List items
const SCHEDULES_ACCORDION_ITEM = 'Schedules';
const MANAGEIQ_REGION_ACCORDION_ITEM = /^ManageIQ Region:/;

// Field values
const BASIC_INFO_SUB_HEADER = 'Basic Information';
const NAME_FIELD_LABEL = 'Name';
const DESCRIPTION_FIELD_LABEL = 'Description';
const ACTIVE_CHECKBOX_FIELD_LABEL = 'Active';
const ACTION_TYPE_FIELD_LABEL = 'Action';
const FILTER_TYPE_FIELD_LABEL = 'Filter';
const ZONE_FIELD_LABEL = 'Zone';
const OBJECT_DETAILS_SUB_HEADER = 'Object Details';
const SYSTEM_FIELD_LABEL = 'System/Process';
const MESSAGE_FIELD_LABEL = 'Message';
const REQUEST_FIELD_LABEL = 'Request';
const OBJECT_LABEL_TEXT = 'Object';
const OBJECT_TYPE_FIELD_LABEL = 'Type';
const OBJECT_TYPE_CLOUD_NETWORK = 'Cloud Network';
const ATTRIBUTE_PAIRS_SUB_HEADER = 'Attribute/Value Pairs';
const TIMER_TYPE_FIELD_LABEL = 'Run';
const TIMER_VALUE_FIELD_LABEL = 'Every';
const TIME_ZONE_FIELD_LABEL = 'Time Zone';
const START_DATE_FIELD_LABEL = 'Starting Date';
const START_TIME_FIELD_LABEL = 'Starting Time';
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
const TIME_ZONE_TYPE_HAWAII = '(GMT-10:00) Hawaii';
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
  cy.getFormInputFieldById('time_zone').click();
  cy.contains('[role="option"]', TIME_ZONE_TYPE_HAWAII).click();
  cy.getFormInputFieldById('start_date').type(INITIAL_START_DATE);
  cy.getFormInputFieldById('start_time').type(START_TIME);
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

  it('Validate visibility of elements and dynamic rendering based on dropdown changes', () => {
    // Open add schedule form
    selectConfigMenu(ADD_SCHEDULE_CONFIG_OPTION);

    // Assert basic info header is visible
    cy.contains('h3', BASIC_INFO_SUB_HEADER).should('be.visible');
    // Assert name input field is visible & enabled
    cy.getFormLabelByInputId('name')
      .should('be.visible')
      .and('contain.text', NAME_FIELD_LABEL);
    cy.getFormInputFieldById('name').should('be.visible').and('be.enabled');
    // Assert description input field is visible & enabled
    cy.getFormLabelByInputId('description')
      .should('be.visible')
      .and('contain.text', DESCRIPTION_FIELD_LABEL);
    cy.getFormInputFieldById('description')
      .should('be.visible')
      .and('be.enabled');
    // Assert active checkbox field is visible & enabled
    cy.getFormLabelByInputId('enabled')
      .should('be.visible')
      .and('contain.text', ACTIVE_CHECKBOX_FIELD_LABEL);
    cy.getFormInputFieldById('enabled', 'checkbox')
      .should('be.visible')
      .and('be.enabled');

    /* ===== Selecting any option other than "Automation Tasks" from "Action" dropdown does not hide the Filter dropdown ===== */
    // Assert action type dropdown is visible & enabled and then selecting "Vm Analysis" to verify filter type dropdown is visible & enabled
    cy.getFormLabelByInputId('action_typ')
      .should('be.visible')
      .and('contain.text', ACTION_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById('action_typ')
      .should('be.visible')
      .and('be.enabled')
      .select(ACTION_TYPE_VM_ANALYSIS);
    cy.getFormLabelByInputId('filter_typ')
      .should('be.visible')
      .and('contain.text', FILTER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById('filter_typ')
      .should('be.visible')
      .and('be.enabled');
    // Selecting "Template Analysis" to verify filter type dropdown is visible & enabled
    cy.getFormSelectFieldById('action_typ').select(
      ACTION_TYPE_TEMPLATE_ANALYSIS
    );
    cy.getFormLabelByInputId('filter_typ')
      .should('be.visible')
      .and('contain.text', FILTER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById('filter_typ')
      .should('be.visible')
      .and('be.enabled');
    // Selecting "Host Analysis" to verify filter type dropdown is visible & enabled
    cy.getFormSelectFieldById('action_typ').select(ACTION_TYPE_HOST_ANALYSIS);
    cy.getFormLabelByInputId('filter_typ')
      .should('be.visible')
      .and('contain.text', FILTER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById('filter_typ')
      .should('be.visible')
      .and('be.enabled');
    // Selecting "Container Analysis" to verify filter type dropdown is visible & enabled
    cy.getFormSelectFieldById('action_typ').select(
      ACTION_TYPE_CONTAINER_ANALYSIS
    );
    cy.getFormLabelByInputId('filter_typ')
      .should('be.visible')
      .and('contain.text', FILTER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById('filter_typ')
      .should('be.visible')
      .and('be.enabled');
    // Selecting "Cluster Analysis" to verify filter type dropdown is visible & enabled
    cy.getFormSelectFieldById('action_typ').select(
      ACTION_TYPE_CLUSTER_ANALYSIS
    );
    cy.getFormLabelByInputId('filter_typ')
      .should('be.visible')
      .and('contain.text', FILTER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById('filter_typ')
      .should('be.visible')
      .and('be.enabled');
    // Selecting "DataStore Analysis" to verify filter type dropdown is visible & enabled
    cy.getFormSelectFieldById('action_typ').select(
      ACTION_TYPE_DATA_STORE_ANALYSIS
    );
    cy.getFormLabelByInputId('filter_typ')
      .should('be.visible')
      .and('contain.text', FILTER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById('filter_typ')
      .should('be.visible')
      .and('be.enabled');
    // Selecting "Vm Compilance Check" to verify filter type dropdown is visible & enabled
    cy.getFormSelectFieldById('action_typ').select(
      ACTION_TYPE_VM_COMPILANCE_CHECK
    );
    cy.getFormLabelByInputId('filter_typ')
      .should('be.visible')
      .and('contain.text', FILTER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById('filter_typ')
      .should('be.visible')
      .and('be.enabled');
    // Selecting "Host Compilance Check" to verify filter type dropdown is visible & enabled
    cy.getFormSelectFieldById('action_typ').select(
      ACTION_TYPE_HOST_COMPILANCE_CHECK
    );
    cy.getFormLabelByInputId('filter_typ')
      .should('be.visible')
      .and('contain.text', FILTER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById('filter_typ')
      .should('be.visible')
      .and('be.enabled');
    // Selecting "Container Compilance Check" to verify filter type dropdown is visible & enabled
    cy.getFormSelectFieldById('action_typ').select(
      ACTION_TYPE_CONTAINER_COMPILANCE_CHECK
    );
    cy.getFormLabelByInputId('filter_typ')
      .should('be.visible')
      .and('contain.text', FILTER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById('filter_typ')
      .should('be.visible')
      .and('be.enabled');

    /* ===== Selecting "Automation Tasks" option from "Action" dropdown shows Zone, Object details & Object fields ===== */
    cy.getFormSelectFieldById('action_typ').select(
      ACTION_TYPE_AUTOMATION_TASKS
    );
    // Assert Zone select field is visible & enabled
    cy.getFormLabelByInputId('zone_id')
      .should('be.visible')
      .and('contain.text', ZONE_FIELD_LABEL);
    cy.getFormSelectFieldById('zone_id').should('be.visible').and('be.enabled');

    // Verifying Object Details fields
    cy.contains('h3[name="object_details"]', OBJECT_DETAILS_SUB_HEADER).should(
      'be.visible'
    );
    // Assert System/Process dropdown is visible & enabled
    cy.getFormLabelByInputId('instance_name')
      .should('be.visible')
      .and('contain.text', SYSTEM_FIELD_LABEL);
    cy.getFormSelectFieldById('instance_name')
      .should('be.visible')
      .and('be.enabled');
    // Assert Messsage input field is visible & enabled
    cy.getFormLabelByInputId('message')
      .should('be.visible')
      .and('contain.text', MESSAGE_FIELD_LABEL);
    cy.getFormInputFieldById('message').should('be.visible').and('be.enabled');
    // Assert Request input field is visible & enabled
    cy.getFormLabelByInputId('request')
      .should('be.visible')
      .and('contain.text', REQUEST_FIELD_LABEL);
    cy.getFormInputFieldById('request').should('be.visible').and('be.enabled');

    // Verifying Object fields
    cy.contains('h3[name="object_attributes"]', OBJECT_LABEL_TEXT).should(
      'be.visible'
    );
    // Assert Type Combobox is visible & enabled and then selecting "Cloud Network" option
    cy.getFormLabelByInputId('target_class')
      .should('be.visible')
      .and('contain.text', OBJECT_TYPE_FIELD_LABEL);
    cy.getFormInputFieldById('target_class')
      .should('be.visible')
      .and('be.enabled')
      .click();
    cy.contains('[role="option"]', OBJECT_TYPE_CLOUD_NETWORK).click();
    // Assert Object Combobox is visible & enabled, once Type is selected
    cy.getFormLabelByInputId('target_id')
      .should('be.visible')
      .and('contain.text', OBJECT_LABEL_TEXT);
    cy.getFormInputFieldById('target_id')
      .should('be.visible')
      .and('be.enabled');

    // Verifying Attribute/Value pairs fields
    cy.contains('h3', ATTRIBUTE_PAIRS_SUB_HEADER).should('be.visible');
    // Verifying 5 attribute-value pairs text fields are visible and enabled
    cy.getFormInputFieldById('attribute_1')
      .should('be.visible')
      .and('be.enabled');
    cy.getFormInputFieldById('value_1').should('be.visible').and('be.enabled');
    cy.getFormInputFieldById('attribute_2')
      .should('be.visible')
      .and('be.enabled');
    cy.getFormInputFieldById('value_2').should('be.visible').and('be.enabled');
    cy.getFormInputFieldById('attribute_3')
      .should('be.visible')
      .and('be.enabled');
    cy.getFormInputFieldById('value_3').should('be.visible').and('be.enabled');
    cy.getFormInputFieldById('attribute_4')
      .should('be.visible')
      .and('be.enabled');
    cy.getFormInputFieldById('value_4').should('be.visible').and('be.enabled');
    cy.getFormInputFieldById('attribute_5')
      .should('be.visible')
      .and('be.enabled');
    cy.getFormInputFieldById('value_5').should('be.visible').and('be.enabled');

    /* ===== Selecting "Once" option from "Run" dropdown should not show "Every" dropdown ===== */
    // Assert Run(timer type) dropdown is visible & enabled and then selecting "Once" option
    cy.getFormLabelByInputId('timer_typ')
      .should('be.visible')
      .and('contain.text', TIMER_TYPE_FIELD_LABEL);
    cy.getFormSelectFieldById('timer_typ')
      .should('be.visible')
      .and('be.enabled')
      .select(TIMER_TYPE_ONCE);
    // Assert "Every" dropdown is hidden
    cy.getFormInputFieldById('timer_value').should('not.exist');

    /* ===== Selecting any other option other than "Once" from "Run" dropdown should show "Every" dropdown ===== */
    // Selecting "Hourly" to verify timer dropdown is visible & enabled
    cy.getFormSelectFieldById('timer_typ').select(TIMER_TYPE_HOURLY);
    cy.getFormLabelByInputId('timer_value')
      .should('be.visible')
      .and('contain.text', TIMER_VALUE_FIELD_LABEL);
    cy.getFormSelectFieldById('timer_value')
      .should('be.visible')
      .and('be.enabled');
    // Selecting "Daily" to verify timer dropdown is visible & enabled
    cy.getFormSelectFieldById('timer_typ').select(TIMER_TYPE_DAILY);
    cy.getFormLabelByInputId('timer_value')
      .should('be.visible')
      .and('contain.text', TIMER_VALUE_FIELD_LABEL);
    cy.getFormSelectFieldById('timer_value')
      .should('be.visible')
      .and('be.enabled');
    // Selecting "Weekly" to verify timer dropdown is visible & enabled
    cy.getFormSelectFieldById('timer_typ').select(TIMER_TYPE_WEEKLY);
    cy.getFormLabelByInputId('timer_value')
      .should('be.visible')
      .and('contain.text', TIMER_VALUE_FIELD_LABEL);
    cy.getFormSelectFieldById('timer_value')
      .should('be.visible')
      .and('be.enabled');
    // Selecting "Monthly" to verify timer dropdown is visible & enabled
    cy.getFormSelectFieldById('timer_typ').select(TIMER_TYPE_MONTHLY);
    cy.getFormLabelByInputId('timer_value')
      .should('be.visible')
      .and('contain.text', TIMER_VALUE_FIELD_LABEL);
    cy.getFormSelectFieldById('timer_value')
      .should('be.visible')
      .and('be.enabled');

    // Assert timezone dropdown is visible & enabled
    cy.getFormLabelByInputId('time_zone')
      .should('be.visible')
      .and('contain.text', TIME_ZONE_FIELD_LABEL);
    cy.getFormInputFieldById('time_zone')
      .should('be.visible')
      .and('be.enabled');
    // Assert starting date field is visible & enabled
    cy.getFormLabelByInputId('start_date')
      .should('be.visible')
      .and('contain.text', START_DATE_FIELD_LABEL);
    cy.getFormInputFieldById('start_date')
      .should('be.visible')
      .and('be.enabled');
    // Assert starting time field is visible & enabled
    cy.getFormLabelByInputId('start_time')
      .should('be.visible')
      .and('contain.text', START_TIME_FIELD_LABEL);
    cy.getFormInputFieldById('start_time')
      .should('be.visible')
      .and('be.enabled');
    // Assert save button is visible and disabled
    cy.getFormFooterButtonByType(SAVE_BUTTON_TEXT, 'submit')
      .should('be.visible')
      .and('be.disabled');
    // Assert cancel button is visible and enabled
    cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT)
      .should('be.visible')
      .and('be.enabled');
  });

  it('Checking whether Cancel button works on the Add form', () => {
    // Open add schedule form
    selectConfigMenu(ADD_SCHEDULE_CONFIG_OPTION);
    // Cancel the form
    cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT).click();
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
    cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT).click();
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
