/* eslint-disable no-undef */

const textConstants = {
  // List items
  schedulesAccordionItem: 'Schedules',

  // Field values
  initialScheduleName: 'Test name',
  editedScheduleName: 'Dummy name',
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
  addScheduleConfigOption: 'Add a new Schedule',
  deleteScheduleConfigOption: 'Delete this Schedule from the Database',
  editScheduleConfigOption: 'Edit this Schedule',
  disableScheduleConfigOption: 'Disable this Schedule',
  enableScheduleConfigOption: 'Enable this Schedule',
  queueScheduleConfigOption: 'Queue up this Schedule to run now',

  // Menu options
  settingsMenuOption: 'Settings',
  appSettingsMenuOption: 'Application Settings',

  // Flash message types
  flashTypeSuccess: 'success',
  flashTypeWarning: 'warning',
  flashTypeError: 'error',
  flashTypeInfo: 'info',

  // Flash message text snippets
  flashMessageScheduleQueued: 'queued to run',
  flashMessageOperationCanceled: 'cancelled',
  flashMessageScheduleDisabled: 'disabled',
  flashMessageScheduleEnabled: 'enabled',
  flashMessageScheduleSaved: 'saved',
  flashMessageResetSchedule: 'reset',
  flashMessageScheduleDeleted: 'delete successful',
  flashMessageFailedToAddSchedule: 'failed',

  // Browser alert text snippets
  browserAlertDeleteConfirmText: 'will be permanently removed',
};

const {
  settingsMenuOption,
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

function selectConfigMenu(configuration = addScheduleConfigOption) {
  cy.get(
    `.miq-toolbar-actions .miq-toolbar-group button[title="Configuration"]`
  ).click();
  return cy
    .get(
      `ul#overflow-menu-1__menu-body button[title="${configuration}"][role="menuitem"]`
    )
    .click();
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
  // Checks if Save button is enabled once all required fields are filled
  cy.contains('#main-content .bx--btn-set button[type="submit"]', saveButton)
    .should('be.enabled')
    .click();
}

function deleteSchedule(scheduleName = initialScheduleName) {
  // Selecting the schedule
  cy.accordionItem(scheduleName);
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
    cy.intercept('POST', '/ops/tree_select?id=xx-msc&text=Schedules').as(
      'getSchedules'
    );
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
    cy.expect_flash(flashTypeSuccess, flashMessageOperationCanceled);
  });

  it('Checking whether add, edit & delete schedule works', () => {
    /* ===== Adding a schedule ===== */
    addSchedule();
    cy.expect_flash(flashTypeSuccess, flashMessageScheduleSaved);

    /* ===== Editing a schedule ===== */
    // Selecting the created schedule
    cy.accordionItem(initialScheduleName);
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

    /* ===== Checking whether Cancel button works ===== */
    // Selecting the created schedule
    cy.accordionItem(initialScheduleName);
    selectConfigMenu(editScheduleConfigOption);
    cy.contains(
      '#main-content .bx--btn-set button[type="button"]',
      cancelButton
    )
      .should('be.enabled')
      .click();
    cy.expect_flash(flashTypeSuccess, flashMessageOperationCanceled);

    /* ===== Checking whether Reset button works ===== */
    // Selecting the created schedule
    cy.accordionItem(initialScheduleName);
    selectConfigMenu(editScheduleConfigOption);
    // Editing description and start date
    cy.get('input#description').clear().type(editedDescription);
    cy.get('input#start_date').clear().type(editedStartDate);
    cy.contains('#main-content .bx--btn-set button[type="button"]', resetButton)
      .should('be.enabled')
      .click();
    cy.expect_flash(flashTypeWarning, flashMessageResetSchedule);
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
    cy.expect_flash(flashTypeError, flashMessageFailedToAddSchedule);
  });

  it('Checking whether Disabling, Enabling & Queueing up the schedule works', () => {
    /* ===== Adding a schedule ===== */
    addSchedule();
    // Selecting the created schedule
    cy.accordionItem(initialScheduleName);

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
