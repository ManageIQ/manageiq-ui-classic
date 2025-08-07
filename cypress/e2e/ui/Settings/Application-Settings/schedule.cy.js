/* eslint-disable no-undef */

const textConstants = {
  // Component route url
  componentRouteUrl: '/ops/explorer',

  // List items
  schedulesAccordionItem: 'Schedules',

  // Field values
  initialScheduleName: 'Test-name',
  editedScheduleName: 'Dummy-name',
  initialDescription: 'Test description',
  editedDescription: 'Dummy description',
  actionTypeVmAnalysis: 'vm',
  actionTypeTemplateAnalysis: 'miq_template',
  actionTypeHostAnalysis: 'host',
  actionTypeContainerAnalysis: 'container_image',
  actionTypeClusterAnalysis: 'emscluster',
  actionTypeDataStoreAnalysis: 'storage',
  actionTypeVmCompilanceCheck: 'vm_check_compliance',
  actionTypeHostCompilanceCheck: 'host_check_compliance',
  actionTypeContainerCompilanceCheck: 'container_image_check_compliance',
  actionTypeAutomationTasks: 'automation_request',
  filterTypeVmCluster: 'cluster',
  timerTypeOnce: 'Once',
  timerTypeHourly: 'Hourly',
  timerTypeDaily: 'Daily',
  timerTypeWeekly: 'Weekly',
  timerTypeMonthly: 'Monthly',
  frequencyTypeHour: '1 Hour',
  timezoneTypeHawaii: '(GMT-10:00) Hawaii',
  initialStartDate: '06/30/2025',
  editedStartDate: '07/21/2025',
  startTime: '11:23',

  // Buttons
  saveButton: 'Save',
  cancelButton: 'Cancel',
  resetButton: 'Reset',

  // Config options
  configToolbarButton: 'Configuration',
  addScheduleConfigOption: 'Add a new Schedule',
  deleteScheduleConfigOption: 'Delete this Schedule from the Database',
  editScheduleConfigOption: 'Edit this Schedule',
  disableScheduleConfigOption: 'Disable this Schedule',
  enableScheduleConfigOption: 'Enable this Schedule',
  queueScheduleConfigOption: 'Queue up this Schedule to run now',

  // Menu options
  settingsOption: 'Settings',
  appSettingsMenuOption: 'Application Settings',

  // Flash message types
  flashTypeSuccess: 'success',
  flashTypeWarning: 'warning',
  flashTypeError: 'error',
  flashTypeInfo: 'info',

  // Flash message text snippets
  flashMessageScheduleQueued: 'queued',
  flashMessageOperationCanceled: 'cancel',
  flashMessageScheduleDisabled: 'disabled',
  flashMessageScheduleEnabled: 'enabled',
  flashMessageScheduleSaved: 'saved',
  flashMessageResetSchedule: 'reset',
  flashMessageScheduleDeleted: 'delete',
  flashMessageFailedToAddSchedule: 'failed',

  // Browser alert text snippets
  browserAlertDeleteConfirmText: 'removed',
};

const {
  componentRouteUrl,
  settingsOption,
  appSettingsMenuOption,
  actionTypeVmAnalysis,
  actionTypeTemplateAnalysis,
  actionTypeHostAnalysis,
  actionTypeContainerAnalysis,
  actionTypeClusterAnalysis,
  actionTypeDataStoreAnalysis,
  actionTypeVmCompilanceCheck,
  actionTypeHostCompilanceCheck,
  actionTypeContainerCompilanceCheck,
  actionTypeAutomationTasks,
  timerTypeOnce,
  timerTypeHourly,
  timerTypeDaily,
  timerTypeWeekly,
  timerTypeMonthly,
  cancelButton,
  saveButton,
  initialScheduleName,
  editScheduleConfigOption,
  editedScheduleName,
  editedDescription,
  editedStartDate,
  resetButton,
  initialDescription,
  initialStartDate,
  disableScheduleConfigOption,
  enableScheduleConfigOption,
  queueScheduleConfigOption,
  addScheduleConfigOption,
  frequencyTypeHour,
  timezoneTypeHawaii,
  startTime,
  deleteScheduleConfigOption,
  schedulesAccordionItem,
  configToolbarButton,
  flashTypeSuccess,
  flashTypeWarning,
  flashTypeError,
  flashTypeInfo,
  flashMessageScheduleQueued,
  flashMessageOperationCanceled,
  flashMessageScheduleDisabled,
  flashMessageScheduleEnabled,
  flashMessageScheduleSaved,
  flashMessageResetSchedule,
  flashMessageScheduleDeleted,
  flashMessageFailedToAddSchedule,
  browserAlertDeleteConfirmText,
} = textConstants;

function selectConfigMenu(menuOption) {
  return cy.toolbar(configToolbarButton, menuOption);
}

function addSchedule() {
  // Open add schedule form
  selectConfigMenu(addScheduleConfigOption);
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

function deleteSchedule(scheduleName = initialScheduleName) {
  // Selecting the schedule and intercepting the API call to get schedule details
  interceptGetScheduleDetailsApi(scheduleName);
  // Listening for the browser confirm alert and confirming deletion
  cy.expect_browser_confirm_with_text({
    confirmTriggerFn: () => selectConfigMenu(deleteScheduleConfigOption),
    containsText: browserAlertDeleteConfirmText,
  });
  cy.expect_flash(flashTypeSuccess, flashMessageScheduleDeleted);
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
      return false; // exit iteration
    }
    return null; // has no impact, just to get rid of eslint warning
  });
}

function selectAndAssertDropdownValue(id, value) {
  cy.get(`select#${id}`).select(value);
  cy.get(`select#${id}`).should('have.value', value);
}

function assertSelectFieldWithLabel(id) {
  cy.get(`label[for="${id}"]`).should('exist');
  cy.get(`select#${id}`).should('exist');
}

function selectActionTypeAndAssertFilterTypeDropdown(value) {
  selectAndAssertDropdownValue('action_typ', value);
  assertSelectFieldWithLabel('filter_typ');
}

function selectTimerTypeAndAssertTimerDropdown(value) {
  selectAndAssertDropdownValue('timer_typ', value);
  assertSelectFieldWithLabel('timer_value');
}

function assertComboboxWithLabel(id) {
  cy.get(`label[for="${id}"]`).should('exist');
  cy.get(`input[role="combobox"]#${id}`).should('exist');
}

function assertInputFieldWithLabel(id) {
  cy.get(`label[for="${id}"]`).should('exist');
  cy.get(`input#${id}`).should('exist');
}

describe('Automate Schedule form operations: Settings > Application Settings > Settings > Schedules > Configuration > Add a new schedule', () => {
  beforeEach(() => {
    cy.login();
    // Navigate to Application-Settings
    cy.menu(settingsOption, appSettingsMenuOption);
    // Expand Settings accordion panel
    cy.accordion(settingsOption);
    // Select Schedules accordion item
    cy.intercept({
      method: 'POST',
      pathname: '/ops/tree_select',
      query: { text: schedulesAccordionItem },
    }).as('getSchedules');
    cy.accordionItem(schedulesAccordionItem);
    cy.wait('@getSchedules');
  });

  it('Validate visibility of elements based on dropdown selections', () => {
    // Open add schedule form
    selectConfigMenu(addScheduleConfigOption);

    /* ===== Selecting any option other than "Automation Tasks" from "Action" dropdown does not hide the Filter dropdown ===== */

    // Selecting "Vm Analysis" to verify filter type dropdown
    selectActionTypeAndAssertFilterTypeDropdown(actionTypeVmAnalysis);
    // Selecting "Template Analysis" to verify filter type dropdown
    selectActionTypeAndAssertFilterTypeDropdown(actionTypeTemplateAnalysis);
    // Selecting "Host Analysis" to verify filter type dropdown
    selectActionTypeAndAssertFilterTypeDropdown(actionTypeHostAnalysis);
    // Selecting "Container Analysis" to verify filter type dropdown
    selectActionTypeAndAssertFilterTypeDropdown(actionTypeContainerAnalysis);
    // Selecting "Cluster Analysis" to verify filter type dropdown
    selectActionTypeAndAssertFilterTypeDropdown(actionTypeClusterAnalysis);
    // Selecting "DataStore Analysis" to verify filter type dropdown
    selectActionTypeAndAssertFilterTypeDropdown(actionTypeDataStoreAnalysis);
    // Selecting "Vm Compilance Check" to verify filter type dropdown
    selectActionTypeAndAssertFilterTypeDropdown(actionTypeVmCompilanceCheck);
    // Selecting "Host Compilance Check" to verify filter type dropdown
    selectActionTypeAndAssertFilterTypeDropdown(actionTypeHostCompilanceCheck);
    // Selecting "Container Compilance Check" to verify filter type dropdown
    selectActionTypeAndAssertFilterTypeDropdown(
      actionTypeContainerCompilanceCheck
    );

    /* ===== Selecting "Automation Tasks" option from "Action" dropdown shows Zone, Object details & Object fields ===== */

    selectAndAssertDropdownValue('action_typ', actionTypeAutomationTasks);

    // Checking for Zone dropdown
    assertSelectFieldWithLabel('zone_id');

    // Checking for Object Details
    cy.get('h3[name="object_details"]').should('exist');
    // Checking for System/Process dropdown
    assertSelectFieldWithLabel('instance_name');
    // Checking for Messsage textfield
    assertInputFieldWithLabel('message');
    // Checking for Request textfield
    assertInputFieldWithLabel('request');

    // Checking for Object
    cy.get('h3[name="object_attributes"]').should('exist');
    // Checking for Type Combobox
    assertComboboxWithLabel('target_class');
    // Checking for Object Combobox
    assertComboboxWithLabel('target_id');

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

    selectAndAssertDropdownValue('timer_typ', timerTypeOnce);
    // Checking whether the Every dropdown is hidden
    cy.get('input#timer_value').should('not.exist');

    /* ===== Selecting any other option other than "Once" from "Run" dropdown shows the "Every" dropdown ===== */
    // Selecting "Hourly" to verify timer dropdown
    selectTimerTypeAndAssertTimerDropdown(timerTypeHourly);
    // Selecting "Daily" to verify timer dropdown
    selectTimerTypeAndAssertTimerDropdown(timerTypeDaily);
    // Selecting "Weekly" to verify timer dropdown
    selectTimerTypeAndAssertTimerDropdown(timerTypeWeekly);
    // Selecting "Monthly" to verify timer dropdown
    selectTimerTypeAndAssertTimerDropdown(timerTypeMonthly);
  });

  it('Checking whether Cancel button works on the Add form', () => {
    // Open add schedule form
    selectConfigMenu(addScheduleConfigOption);
    // Cancel the form
    cy.contains(
      '#main-content .bx--btn-set button[type="button"]',
      cancelButton
    )
      .should('be.enabled')
      .click();
    cy.expect_flash(flashTypeSuccess, flashMessageOperationCanceled);
  });

  it('Checking whether add, edit & delete schedule works', () => {
    /* ===== Adding a schedule ===== */
    addSchedule();
    cy.expect_flash(flashTypeSuccess, flashMessageScheduleSaved);

    /* ===== Editing a schedule ===== */
    // Selecting the schedule and intercepting the API call to get schedule details
    interceptGetScheduleDetailsApi();
    // Open edit schedule form
    selectConfigMenu(editScheduleConfigOption);
    // Editing name and description
    cy.get('input#name').clear().type(editedScheduleName);
    cy.get('input#description').clear().type(editedDescription);
    // Confirms Save button is enabled after making edits
    cy.contains('#main-content .bx--btn-set button[type="submit"]', saveButton)
      .should('be.enabled')
      .click();
    cy.expect_flash(flashTypeSuccess, flashMessageScheduleSaved);

    /* ===== Delete is already handled from afterEach hook ===== */
  });

  it('Checking whether Cancel & Reset buttons work fine in the Edit form', () => {
    /* ===== Adding a schedule ===== */
    addSchedule();

    /* ===== Checking whether Reset button works ===== */
    // Selecting the schedule and intercepting the API call to get schedule details
    interceptGetScheduleDetailsApi();
    // Open edit schedule form
    selectConfigMenu(editScheduleConfigOption);
    // Editing description and start date
    cy.get('input#description').clear().type(editedDescription);
    cy.get('input#start_date').clear().type(editedStartDate);
    // Resetting
    cy.contains('#main-content .bx--btn-set button[type="button"]', resetButton)
      .should('be.enabled')
      .click();
    cy.expect_flash(flashTypeWarning, flashMessageResetSchedule);
    // Confirming the edited fields contain the old values after resetting
    cy.get('input#description').should('have.value', initialDescription);
    cy.get('input#start_date').should('have.value', initialStartDate);

    /* ===== Checking whether Cancel button works ===== */
    cy.contains(
      '#main-content .bx--btn-set button[type="button"]',
      cancelButton
    )
      .should('be.enabled')
      .click();
    cy.expect_flash(flashTypeSuccess, flashMessageOperationCanceled);
  });

  it('Checking whether creating a duplicate record is restricted', () => {
    /* ===== Adding schedule ===== */
    addSchedule();

    /* ===== Trying to add the same schedule again ===== */
    addSchedule();
    cy.expect_flash(flashTypeError, flashMessageFailedToAddSchedule);
  });

  it('Checking whether Disabling, Enabling & Queueing up the schedule works', () => {
    /* ===== Adding a schedule ===== */
    addSchedule();
    // Selecting the schedule and intercepting the API call to get schedule details
    interceptGetScheduleDetailsApi();

    /* ===== Disabling the schedule ===== */
    selectConfigMenu(disableScheduleConfigOption);
    cy.expect_flash(flashTypeInfo, flashMessageScheduleDisabled);

    /* ===== Enabling the schedule ===== */
    selectConfigMenu(enableScheduleConfigOption);
    cy.expect_flash(flashTypeInfo, flashMessageScheduleEnabled);

    /* ===== Queueing-up the schedule ===== */
    selectConfigMenu(queueScheduleConfigOption);
    cy.expect_flash(flashTypeSuccess, flashMessageScheduleQueued);
  });

  afterEach(() => {
    cy.url()
      ?.then((url) => {
        // Ensures navigation to Settings -> Application-Settings in the UI
        if (!url?.includes(componentRouteUrl)) {
          // Navigate to Settings -> Application-Settings before looking out for Schedules created during test
          cy.menu(settingsOption, appSettingsMenuOption);
        }
      })
      .then(() => {
        invokeCleanupDeletion();
      });
  });
});
