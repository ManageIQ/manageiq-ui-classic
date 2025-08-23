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
  cy.getFormFooterButtonByType(SAVE_BUTTON_TEXT, 'submit').should(
    'be.disabled'
  );
  // Adding data
  cy.getFormInputFieldById('name').type(INITIAL_SCHEDULE_NAME);
  cy.getFormInputFieldById('description').type(INITIAL_DESCRIPTION);
  cy.getFormInputFieldById('enabled', 'checkbox').check({
    force: true,
  });
  // Select Action type option: 'VM Analysis'
  cy.getFormSelectFieldById('action_typ').select(ACTION_TYPE_VM_ANALYSIS);
  // Select Filter type option: 'A Single VM'
  cy.getFormSelectFieldById('filter_typ').select(ACTION_TYPE_VM_ANALYSIS);
  // Select Run option: 'Hours'
  cy.getFormSelectFieldById('timer_typ').select(TIMER_TYPE_HOURLY);
  // Select Every option: '1 Hour'
  cy.getFormSelectFieldById('timer_value').select(FREQUENCY_TYPE_HOUR);
  // Select Time zone option: '(GMT-10:00) Hawaii'
  cy.getFormInputFieldById('time_zone').click();
  cy.contains('[role="option"]', TIMEZONE_TYPE_HAWAII)
    .should('be.visible')
    .click();
  cy.getFormInputFieldById('start_date').type(INITIAL_START_DATE);
  cy.getFormInputFieldById('start_time').type(START_TIME);
  // Intercepting the API call for adding a new schedule
  cy.interceptApi({
    alias: 'addScheduleApi',
    urlPattern: '/ops/schedule_edit/new?button=save',
    triggerFn: () =>
      cy
        .getFormFooterButtonByType(SAVE_BUTTON_TEXT, 'submit')
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
  cy.selectAccordionItem([
    MANAGEIQ_REGION_ACCORDION_ITEM,
    SCHEDULES_ACCORDION_ITEM,
    scheduleName,
  ]);
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

    // Selecting "Vm Analysis" to verify filter type dropdown
    cy.getFormSelectFieldById('action_typ').select(ACTION_TYPE_VM_ANALYSIS);
    cy.getFormLabelByInputId('filter_typ').should('exist');
    cy.getFormSelectFieldById('filter_typ').should('exist');
    // Selecting "Template Analysis" to verify filter type dropdown
    cy.getFormSelectFieldById('action_typ').select(
      ACTION_TYPE_TEMPLATE_ANALYSIS
    );
    cy.getFormLabelByInputId('filter_typ').should('exist');
    cy.getFormSelectFieldById('filter_typ').should('exist');
    // Selecting "Host Analysis" to verify filter type dropdown
    cy.getFormSelectFieldById('action_typ').select(ACTION_TYPE_HOST_ANALYSIS);
    cy.getFormLabelByInputId('filter_typ').should('exist');
    cy.getFormSelectFieldById('filter_typ').should('exist');
    // Selecting "Container Analysis" to verify filter type dropdown
    cy.getFormSelectFieldById('action_typ').select(
      ACTION_TYPE_CONTAINER_ANALYSIS
    );
    cy.getFormLabelByInputId('filter_typ').should('exist');
    cy.getFormSelectFieldById('filter_typ').should('exist');
    // Selecting "Cluster Analysis" to verify filter type dropdown
    cy.getFormSelectFieldById('action_typ').select(
      ACTION_TYPE_CLUSTER_ANALYSIS
    );
    cy.getFormLabelByInputId('filter_typ').should('exist');
    cy.getFormSelectFieldById('filter_typ').should('exist');
    // Selecting "DataStore Analysis" to verify filter type dropdown
    cy.getFormSelectFieldById('action_typ').select(
      ACTION_TYPE_DATA_STORE_ANALYSIS
    );
    cy.getFormLabelByInputId('filter_typ').should('exist');
    cy.getFormSelectFieldById('filter_typ').should('exist');
    // Selecting "Vm Compilance Check" to verify filter type dropdown
    cy.getFormSelectFieldById('action_typ').select(
      ACTION_TYPE_VM_COMPILANCE_CHECK
    );
    cy.getFormLabelByInputId('filter_typ').should('exist');
    cy.getFormSelectFieldById('filter_typ').should('exist');
    // Selecting "Host Compilance Check" to verify filter type dropdown
    cy.getFormSelectFieldById('action_typ').select(
      ACTION_TYPE_HOST_COMPILANCE_CHECK
    );
    cy.getFormLabelByInputId('filter_typ').should('exist');
    cy.getFormSelectFieldById('filter_typ').should('exist');
    // Selecting "Container Compilance Check" to verify filter type dropdown
    cy.getFormSelectFieldById('action_typ').select(
      ACTION_TYPE_CONTAINER_COMPILANCE_CHECK
    );
    cy.getFormLabelByInputId('filter_typ').should('exist');
    cy.getFormSelectFieldById('filter_typ').should('exist');

    /* ===== Selecting "Automation Tasks" option from "Action" dropdown shows Zone, Object details & Object fields ===== */

    cy.getFormSelectFieldById('action_typ').select(
      ACTION_TYPE_AUTOMATION_TASKS
    );
    cy.getFormSelectFieldById('action_typ').should(
      'have.value',
      ACTION_TYPE_AUTOMATION_TASKS
    );

    // Checking for Zone dropdown
    cy.getFormLabelByInputId('zone_id').should('exist');
    cy.getFormSelectFieldById('zone_id').should('exist');

    // Checking for Object Details
    cy.get('h3[name="object_details"]').should('exist');
    // Checking for System/Process dropdown
    cy.getFormLabelByInputId('instance_name').should('exist');
    cy.getFormSelectFieldById('instance_name').should('exist');
    // Checking for Messsage textfield
    cy.getFormLabelByInputId('message').should('exist');
    cy.getFormInputFieldById('message').should('exist');
    // Checking for Request textfield
    cy.getFormLabelByInputId('request').should('exist');
    cy.getFormInputFieldById('request').should('exist');

    // Checking for Object
    cy.get('h3[name="object_attributes"]').should('exist');
    // Checking for Type Combobox
    cy.getFormLabelByInputId('target_class').should('exist');
    cy.getFormInputFieldById('target_class').should('exist');
    // Checking for Object Combobox
    cy.getFormLabelByInputId('target_id').should('exist');
    cy.getFormInputFieldById('target_id').should('exist');

    // Checking for Attribute/Value pairs
    cy.contains('h3', 'Attribute/Value Pairs').should('exist');
    // Checking for 5 attribute-value pairs text fields
    cy.getFormInputFieldById('attribute_1').should('exist');
    cy.getFormInputFieldById('value_1').should('exist');
    cy.getFormInputFieldById('attribute_2').should('exist');
    cy.getFormInputFieldById('value_2').should('exist');
    cy.getFormInputFieldById('attribute_3').should('exist');
    cy.getFormInputFieldById('value_3').should('exist');
    cy.getFormInputFieldById('attribute_4').should('exist');
    cy.getFormInputFieldById('value_4').should('exist');
    cy.getFormInputFieldById('attribute_5').should('exist');
    cy.getFormInputFieldById('value_5').should('exist');

    /* ===== Selecting "Once" option from "Run" dropdown does not show the "Every" dropdown ===== */
    cy.getFormSelectFieldById('timer_typ').select(TIMER_TYPE_ONCE);
    cy.getFormSelectFieldById('timer_typ').should(
      'have.value',
      TIMER_TYPE_ONCE
    );
    // Checking whether the Every dropdown is hidden
    cy.getFormInputFieldById('timer_value').should('not.exist');

    /* ===== Selecting any other option other than "Once" from "Run" dropdown shows the "Every" dropdown ===== */
    // Selecting "Hourly" to verify timer dropdown
    cy.getFormSelectFieldById('timer_typ').select(TIMER_TYPE_HOURLY);
    cy.getFormLabelByInputId('timer_value').should('exist');
    cy.getFormSelectFieldById('timer_value').should('exist');
    // Selecting "Daily" to verify timer dropdown
    cy.getFormSelectFieldById('timer_typ').select(TIMER_TYPE_DAILY);
    cy.getFormLabelByInputId('timer_value').should('exist');
    cy.getFormSelectFieldById('timer_value').should('exist');
    // Selecting "Weekly" to verify timer dropdown
    cy.getFormSelectFieldById('timer_typ').select(TIMER_TYPE_WEEKLY);
    cy.getFormLabelByInputId('timer_value').should('exist');
    cy.getFormSelectFieldById('timer_value').should('exist');
    // Selecting "Monthly" to verify timer dropdown
    cy.getFormSelectFieldById('timer_typ').select(TIMER_TYPE_MONTHLY);
    cy.getFormLabelByInputId('timer_value').should('exist');
    cy.getFormSelectFieldById('timer_value').should('exist');
  });

  it('Checking whether Cancel button works on the Add form', () => {
    // Open add schedule form
    selectConfigMenu(ADD_SCHEDULE_CONFIG_OPTION);
    // Cancel the form
    cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT)
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
    cy.getFormInputFieldById('name').clear().type(EDITED_SCHEDULE_NAME);
    cy.getFormInputFieldById('description').clear().type(EDITED_DESCRIPTION);
    // Confirms Save button is enabled after making edits
    cy.getFormFooterButtonByType(SAVE_BUTTON_TEXT, 'submit')
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
    cy.getFormInputFieldById('description').clear().type(EDITED_DESCRIPTION);
    cy.getFormInputFieldById('start_date').clear().type(EDITED_START_DATE);
    // Resetting
    cy.getFormFooterButtonByType(RESET_BUTTON_TEXT)
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.warning, FLASH_MESSAGE_RESET_SCHEDULE);
    // Confirming the edited fields contain the old values after resetting
    cy.getFormInputFieldById('description').should(
      'have.value',
      INITIAL_DESCRIPTION
    );
    cy.getFormInputFieldById('start_date').should(
      'have.value',
      INITIAL_START_DATE
    );

    /* ===== Checking whether Cancel button works ===== */
    cy.getFormFooterButtonByType(CANCEL_BUTTON_TEXT)
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
