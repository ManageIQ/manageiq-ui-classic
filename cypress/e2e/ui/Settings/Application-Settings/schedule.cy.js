/* eslint-disable no-undef */
import { flashClassMap } from '../../../../support/assertions/assertion_constants';

// List items
const schedulesAccordionItem = 'Schedules';

// Field values
const initialScheduleName = 'Test-name';
const editedScheduleName = 'Dummy-name';
const initialDescription = 'Test description';
const editedDescription = 'Dummy description';
const actionTypeVmAnalysis = 'vm';
const actionTypeTemplateAnalysis = 'miq_template';
const actionTypeHostAnalysis = 'host';
const actionTypeContainerAnalysis = 'container_image';
const actionTypeClusterAnalysis = 'emscluster';
const actionTypeDataStoreAnalysis = 'storage';
const actionTypeVmCompilanceCheck = 'vm_check_compliance';
const actionTypeHostCompilanceCheck = 'host_check_compliance';
const actionTypeContainerCompilanceCheck = 'container_image_check_compliance';
const actionTypeAutomationTasks = 'automation_request';
const filterTypeVmCluster = 'cluster';
const timerTypeOnce = 'Once';
const timerTypeHourly = 'Hourly';
const timerTypeDaily = 'Daily';
const timerTypeWeekly = 'Weekly';
const timerTypeMonthly = 'Monthly';
const frequencyTypeHour = '1 Hour';
const timezoneTypeHawaii = '(GMT-10:00) Hawaii';
const initialStartDate = '06/30/2025';
const editedStartDate = '07/21/2025';
const startTime = '11:23';

// Buttons
const saveButton = 'Save';
const cancelButton = 'Cancel';
const resetButton = 'Reset';

// Config options
const configToolbarButton = 'Configuration';
const addScheduleConfigOption = 'Add a new Schedule';
const deleteScheduleConfigOption = 'Delete this Schedule from the Database';
const editScheduleConfigOption = 'Edit this Schedule';
const disableScheduleConfigOption = 'Disable this Schedule';
const enableScheduleConfigOption = 'Enable this Schedule';
const queueScheduleConfigOption = 'Queue up this Schedule to run now';

// Menu options
const settingsMenuOption = 'Settings';
const appSettingsMenuOption = 'Application Settings';

// Flash message text snippets
const flashMessageScheduleQueued = 'queued to run';
const flashMessageOperationCanceled = 'cancelled';
const flashMessageScheduleDisabled = 'disabled';
const flashMessageScheduleEnabled = 'enabled';
const flashMessageScheduleSaved = 'saved';
const flashMessageResetSchedule = 'reset';
const flashMessageScheduleDeleted = 'delete successful';
const flashMessageFailedToAddSchedule = 'failed';

// Browser alert text snippets
const browserAlertDeleteConfirmText = 'will be permanently removed';

function selectConfigMenu(menuOption = addScheduleConfigOption) {
  return cy.toolbar(configToolbarButton, menuOption);
}

function addSchedule() {
  selectConfigMenu();
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
  cy.intercept('POST', '/ops/schedule_edit/new?button=save').as(
    'addScheduleApi'
  );
  cy.contains('#main-content .bx--btn-set button[type="submit"]', saveButton)
    .should('be.enabled') // Checks if Save button is enabled once all required fields are filled
    .click();
  // Wait for the API call to complete
  cy.wait('@addScheduleApi');
}

function deleteSchedule(scheduleName = initialScheduleName) {
  // Selecting the schedule and intercepting the API call to get schedule details
  interceptGetScheduleDetailsApi(scheduleName);
  // Listening for the browser confirm alert and confirming deletion
  cy.expect_browser_confirm_with_text({
    confirmTriggerFn: () => selectConfigMenu(deleteScheduleConfigOption),
    containsText: browserAlertDeleteConfirmText,
  });
  cy.expect_flash(flashClassMap.success, flashMessageScheduleDeleted);
}

function interceptGetScheduleDetailsApi(scheduleName = initialScheduleName) {
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

function invokeCleanupDeletion() {
  // Iterate and clean up any leftover schedules created during the test
  cy.get('li.list-group-item').each(($el) => {
    const text = $el?.text()?.trim();
    if (text === initialScheduleName) {
      deleteSchedule();
      return false;
    }
    if (text === editedScheduleName) {
      deleteSchedule(editedScheduleName);
      return false;
    }
    return true;
  });
}

function verifyFilterTypeDropdownExists() {
  cy.get('label[for="filter_typ"]').should('exist');
  cy.get('select#filter_typ').should('exist');
}

function verifyTimerDropdownExists() {
  cy.get('label[for="timer_value"]').should('exist');
  cy.get('select#timer_value').should('exist');
}

describe('Automate Schedule form operations: Settings > Application Settings > Settings > Schedules > Configuration > Add a new schedule', () => {
  beforeEach(() => {
    cy.login();
    cy.menu(settingsMenuOption, appSettingsMenuOption);
    cy.intercept(
      {
        method: 'POST',
        pathname: '/ops/tree_select',
        query: { text: schedulesAccordionItem },
      },
    ).as('getSchedules');
    cy.accordionItem(schedulesAccordionItem);
    cy.wait('@getSchedules');
  });

  it('Validate visibility of elements based on dropdown selections', () => {
    selectConfigMenu();

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
    selectConfigMenu();
    cy.contains(
      '#main-content .bx--btn-set button[type="button"]',
      cancelButton
    )
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.success, flashMessageOperationCanceled);
  });

  it('Checking whether add, edit & delete schedule works', () => {
    /* ===== Adding a schedule ===== */
    addSchedule();
    cy.expect_flash(flashClassMap.success, flashMessageScheduleSaved);

    /* ===== Editing a schedule ===== */
    // Selecting the schedule and intercepting the API call to get schedule details
    interceptGetScheduleDetailsApi();
    selectConfigMenu(editScheduleConfigOption);
    // Editing name and description
    cy.get('input#name').clear().type(editedScheduleName);
    cy.get('input#description').clear().type(editedDescription);
    // Confirms Save button is enabled after making edits
    cy.contains('#main-content .bx--btn-set button[type="submit"]', saveButton)
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.success, flashMessageScheduleSaved);

    /* ===== Delete is already handled from afterEach hook ===== */
  });

  it('Checking whether Cancel & Reset buttons work fine in the Edit form', () => {
    /* ===== Adding a schedule ===== */
    addSchedule();

    /* ===== Checking whether Cancel button works ===== */
    // Selecting the schedule and intercepting the API call to get schedule details
    interceptGetScheduleDetailsApi();
    selectConfigMenu(editScheduleConfigOption);
    cy.contains(
      '#main-content .bx--btn-set button[type="button"]',
      cancelButton
    )
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.success, flashMessageOperationCanceled);

    /* ===== Checking whether Reset button works ===== */
    // Selecting the schedule and intercepting the API call to get schedule details
    interceptGetScheduleDetailsApi();
    selectConfigMenu(editScheduleConfigOption);
    // Editing description and start date
    cy.get('input#description').clear().type(editedDescription);
    cy.get('input#start_date').clear().type(editedStartDate);
    cy.contains('#main-content .bx--btn-set button[type="button"]', resetButton)
      .should('be.enabled')
      .click();
    cy.expect_flash(flashClassMap.warning, flashMessageResetSchedule);
    // Confirming the edited fields contain the old values after resetting
    cy.get('input#description').should('have.value', initialDescription);
    cy.get('input#start_date').should('have.value', initialStartDate);

    // Selecting Schedules menu item to bypass a bug, can be removed once #9505 is merged
    cy.accordionItem(schedulesAccordionItem);
  });

  it('Checking whether creating a duplicate record is restricted', () => {
    /* ===== Adding schedule ===== */
    addSchedule();

    /* ===== Trying to add the same schedule again ===== */
    addSchedule();
    cy.expect_flash(flashClassMap.error, flashMessageFailedToAddSchedule);
  });

  it('Checking whether Disabling, Enabling & Queueing up the schedule works', () => {
    /* ===== Adding a schedule ===== */
    addSchedule();
    // Selecting the schedule and intercepting the API call to get schedule details
    interceptGetScheduleDetailsApi();

    /* ===== Disabling the schedule ===== */
    selectConfigMenu(disableScheduleConfigOption);
    cy.expect_flash(flashClassMap.info, flashMessageScheduleDisabled);

    /* ===== Enabling the schedule ===== */
    selectConfigMenu(enableScheduleConfigOption);
    cy.expect_flash(flashClassMap.info, flashMessageScheduleEnabled);

    /* ===== Queueing-up the schedule ===== */
    selectConfigMenu(queueScheduleConfigOption);
    cy.expect_flash(flashClassMap.success, flashMessageScheduleQueued);
  });

  afterEach(() => {
    cy?.url()?.then((url) => {
      // Ensures navigation to Settings -> Application-Settings in the UI
      if (url?.includes('/ops/explorer')) {
        invokeCleanupDeletion();
      } else {
        // Navigate to Settings -> Application-Settings before looking out for Schedules created during test
        cy.menu(settingsMenuOption, appSettingsMenuOption);
        invokeCleanupDeletion();
      }
    });
  });
});
