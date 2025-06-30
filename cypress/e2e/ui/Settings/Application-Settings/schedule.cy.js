/* eslint-disable no-undef */

function selectConfigMenu(configuration = 'Add a new Schedule') {
  cy.get('#miq_schedule_vmdb_choice').click();
  cy.get(`ul[aria-label="Configuration"] [title="${configuration}"]`).click();
}

function addSchedule() {
  selectConfigMenu();
  // Checks if Save button is disabled initially
  cy.contains(
    '#main-content .bx--btn-set button[type="submit"]',
    'Save'
  ).should('be.disabled');
  // Adding data
  cy.get('input#name').type('Test name');
  cy.get('input#description').type('Test description');
  cy.get('input[type="checkbox"]#enabled').check({ force: true });
  cy.get('select#action_typ').select('VM Analysis');
  cy.get('select#filter_typ').select('A single VM');
  cy.get('select#timer_typ').select('Hourly');
  cy.get('select#timer_value').select('1 Hour');
  cy.get('input[role="combobox"]#time_zone').click();
  cy.contains('[role="option"]', '(GMT-10:00) Hawaii')
    .should('be.visible')
    .click();
  cy.get('input#start_date').type('06/30/2025');
  cy.get('input#start_time').type('11:23');
  // Checks if Save button is enabled once all required fields are filled
  cy.contains('#main-content .bx--btn-set button[type="submit"]', 'Save')
    .should('be.enabled')
    .click();
}

function deleteSchedule(scheduleName = 'Test name') {
  // Selecting the schedule
  cy.contains('li.list-group-item', scheduleName).click();
  // Listening for the browser confirm alert and confirming
  cy.listen_for_browser_confirm_alert();
  selectConfigMenu(deleteScheduleConfigOption);
  cy.expect_flash('success');
}

function invokeCleanupDeletion() {
  // Iterate and clean up any leftover schedules created during the test
  cy.get('li.list-group-item').each(($el) => {
    const text = $el?.text()?.trim();
    if (text === 'Test name') {
      deleteSchedule();
      return false;
    }
    if (text === 'Dummy name') {
      deleteSchedule('Dummy name');
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
    cy.get('[title="Schedules"]').click();
    cy.wait('@getSchedules');
  });

  it('Validate visibility of elements based on dropdown selections', () => {
    selectConfigMenu();

    /* ===== Selecting any option other than "Automation Tasks" from "Action" dropdown does not hide the Filter dropdown ===== */

    cy.get('select#action_typ').select('VM Analysis');
    cy.get('select#action_typ').should('have.value', 'vm');
    // Checking for Filter type dropdown
    cy.get('label[for="filter_typ"]').should('exist');
    cy.get('select#filter_typ').should('exist');

    cy.get('select#action_typ').select('Template Analysis');
    cy.get('select#action_typ').should('have.value', 'miq_template');
    // Checking for Filter type dropdown
    cy.get('label[for="filter_typ"]').should('exist');
    cy.get('select#filter_typ').should('exist');

    cy.get('select#action_typ').select('Host Analysis');
    cy.get('select#action_typ').should('have.value', 'host');
    // Checking for Filter type dropdown
    cy.get('label[for="filter_typ"]').should('exist');
    cy.get('select#filter_typ').should('exist');

    cy.get('select#action_typ').select('Container Image Analysis');
    cy.get('select#action_typ').should('have.value', 'container_image');
    // Checking for Filter type dropdown
    cy.get('label[for="filter_typ"]').should('exist');
    cy.get('select#filter_typ').should('exist');

    cy.get('select#action_typ').select('Cluster Analysis');
    cy.get('select#action_typ').should('have.value', 'emscluster');
    // Checking for Filter type dropdown
    cy.get('label[for="filter_typ"]').should('exist');
    cy.get('select#filter_typ').should('exist');

    cy.get('select#action_typ').select('Datastore Analysis');
    cy.get('select#action_typ').should('have.value', 'storage');
    // Checking for Filter type dropdown
    cy.get('label[for="filter_typ"]').should('exist');
    cy.get('select#filter_typ').should('exist');

    cy.get('select#action_typ').select('VM Compliance Check');
    cy.get('select#action_typ').should('have.value', 'vm_check_compliance');
    // Checking for Filter type dropdown
    cy.get('label[for="filter_typ"]').should('exist');
    cy.get('select#filter_typ').should('exist');

    cy.get('select#action_typ').select('Host Compliance Check');
    cy.get('select#action_typ').should('have.value', 'host_check_compliance');
    // Checking for Filter type dropdown
    cy.get('label[for="filter_typ"]').should('exist');
    cy.get('select#filter_typ').should('exist');

    cy.get('select#action_typ').select('Container Image Compliance Check');
    cy.get('select#action_typ').should(
      'have.value',
      'container_image_check_compliance'
    );
    // Checking for Filter type dropdown
    cy.get('label[for="filter_typ"]').should('exist');
    cy.get('select#filter_typ').should('exist');

    /* ===== Selecting "Automation Tasks" option from "Action" dropdown shows Zone, Object details & Object fields ===== */

    cy.get('select#action_typ').select('Automation Tasks');
    cy.get('select#action_typ').should('have.value', 'automation_request');

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

    cy.get('select#timer_typ').select('Once');
    // Checking whether the Every dropdown is hidden
    cy.get('input#timer_value').should('not.exist');

    /* ===== Selecting any other option other than "Once" from "Run" dropdown shows the "Every" dropdown ===== */

    cy.get('select#timer_typ').select('Hours');
    // Checking whether the "Every" dropdown exist
    cy.get('label[for="timer_value"]').should('exist');
    cy.get('select#timer_value').should('exist');

    cy.get('select#timer_typ').select('Days');
    // Checking whether the "Every" dropdown exist
    cy.get('label[for="timer_value"]').should('exist');
    cy.get('select#timer_value').should('exist');

    cy.get('select#timer_typ').select('Weeks');
    // Checking whether the "Every" dropdown exist
    cy.get('label[for="timer_value"]').should('exist');
    cy.get('select#timer_value').should('exist');

    cy.get('select#timer_typ').select('Months');
    // Checking whether the "Every" dropdown exist
    cy.get('label[for="timer_value"]').should('exist');
    cy.get('select#timer_value').should('exist');
  });

  it('Checking whether Cancel button works on the Add form', () => {
    selectConfigMenu();
    cy.contains('#main-content .bx--btn-set button[type="button"]', 'Cancel')
      .should('be.enabled')
      .click();
    cy.expect_flash('success');
  });

  it('Checking whether add, edit & delete schedule works', () => {
    /* ===== Adding a schedule ===== */
    addSchedule();
    cy.expect_flash('success');

    /* ===== Editing a schedule ===== */
    // Selecting the created schedule
    cy.contains('li.list-group-item', 'Test name').click();
    selectConfigMenu('Edit this Schedule');
    // Editing name and description
    cy.get('input#name').clear().type('Dummy name');
    cy.get('input#description').clear().type('Dummy description');
    // Confirms Save button is enabled after making edits
    cy.contains('#main-content .bx--btn-set button[type="submit"]', 'Save')
      .should('be.enabled')
      .click();
    cy.expect_flash('success');

    /* ===== Delete is already handled from afterEach hook ===== */
  });

  it('Checking whether Cancel & Reset buttons work fine in the Edit form', () => {
    /* ===== Adding a schedule ===== */
    addSchedule();

    /* ===== Checking whether Cancel button works ===== */
    // Selecting the created schedule
    cy.contains('li.list-group-item', 'Test name').click();
    selectConfigMenu('Edit this Schedule');
    cy.contains('#main-content .bx--btn-set button[type="button"]', 'Cancel')
      .should('be.enabled')
      .click();
    cy.expect_flash('success');

    /* ===== Checking whether Reset button works ===== */
    // Selecting the created schedule
    cy.contains('li.list-group-item', 'Test name').click();
    selectConfigMenu('Edit this Schedule');
    // Editing description and start date
    cy.get('input#description').clear().type('Dummy description');
    cy.get('input#start_date').clear().type('07/21/2025');
    cy.contains('#main-content .bx--btn-set button[type="button"]', 'Reset')
      .should('be.enabled')
      .click();
    cy.expect_flash('warning');
    // Confirming the edited fields contain the old values after resetting
    cy.get('input#description').should('have.value', 'Test description');
    cy.get('input#start_date').should('have.value', '06/30/2025');

    // Selecting Schedules menu item to bypass a bug, can be removed once #9505 is merged
    cy.get('[title="Schedules"]').click();
  });

  it('Checking whether creating a duplicate record is restricted', () => {
    /* ===== Adding schedule ===== */
    addSchedule();

    /* ===== Trying to add the same schedule again ===== */
    addSchedule();
    cy.expect_flash('error');
  });

  it('Checking whether Disabling, Enabling & Queueing up the schedule works', () => {
    /* ===== Adding a schedule ===== */
    addSchedule();
    // Selecting the created schedule
    cy.contains('li.list-group-item', 'Test name').click();

    /* ===== Disabling the schedule ===== */
    selectConfigMenu(disableScheduleConfigOption);
    cy.expect_flash('info');

    /* ===== Enabling the schedule ===== */
    selectConfigMenu(enableScheduleConfigOption);
    cy.expect_flash('info');

    /* ===== Queueing-up the schedule ===== */
    selectConfigMenu(queueScheduleConfigOption);
    cy.expect_flash('success');
  });

  afterEach(() => {
    cy?.url()?.then((url) => {
      // Ensures navigation to Settings -> Application-Settings in the UI
      if (url?.includes('/ops/explorer')) {
        invokeCleanupDeletion();
      } else {
        // Navigate to Settings -> Application-Settings before looking out for Schedules created during test
        cy.menu('Settings', 'Application Settings');
        invokeCleanupDeletion();
      }
    });
  });
});
