/* eslint-disable no-undef */

describe('Automate > Customization > Service Dialogs > Add Dialog > Time Picker Tests', () => {
  beforeEach(() => {
    cy.navigateToAddDialog();
    cy.dragAndDropComponent('Timepicker');
  });

  it('should verify default properties of the time picker', () => {
    // Verify the time picker exists
    cy.get('.dynamic-form-field')
      .should('exist');

    // Verify the time picker has default label "Timepicker"
    cy.get('.dynamic-form-field .bx--date-picker')
      .should('exist');

    // Verify the time picker has a label
    cy.get('.dynamic-form-field .dynamic-form-field-item > .bx--label')
      .should('contain', 'Timepicker');
  });

  it('should have edit and remove buttons', () => {
    // Force display of the action buttons and check they exist
    cy.get('.dynamic-form-field')
      .find('.dynamic-form-field-actions')
      .invoke('attr', 'style', 'display: flex !important');

    // Verify the edit button exists
    cy.get('.dynamic-form-field-actions button')
      .first()
      .should('have.attr', 'title', 'Edit field')
      .find('svg')
      .should('exist');

    // Verify the remove button exists
    cy.get('.dynamic-form-field-actions button')
      .last()
      .should('have.attr', 'title', 'Remove field')
      .find('svg')
      .should('exist');
  });

  it('should open the modal when clicking the edit button', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Verify the modal title
    cy.get('.edit-field-modal .bx--modal-header__heading')
      .should('contain', 'Edit this Timepicker');

    cy.closeFieldEditModal();
  });

  it('should have 3 tabs in the edit modal initially', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Verify there are 3 tabs in the modal
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist]')
      .find('li')
      .should('have.length', 3);

    // Verify the tab names
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist]')
      .eq(0)
      .should('contain', 'Field Information');

    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(1)
      .should('contain', 'Options');

    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(2)
      .should('contain', 'Advanced');

    cy.closeFieldEditModal();
  });

  it('should add a fourth tab when dynamic option is enabled', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Enable dynamic option
    cy.get('.edit-field-modal input[name="dynamic"]')
      .check({ force: true });

    // Verify there are now 4 tabs in the modal
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist]')
      .find('li')
      .should('have.length', 4);

    // Verify the fourth tab name
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(3)
      .should('contain', 'Overridable Options');

    cy.closeFieldEditModal();
  });

  it('should disable save button when label or name is not entered', () => {
    const getSubmitButton = () => {
      return cy.get('.edit-field-modal button[type="submit"]')
        .scrollIntoView()
        .should('be.visible');
    };

    const verifyButtonState = (isDisabled) => {
      getSubmitButton().should(isDisabled ? 'be.disabled' : 'not.be.disabled');
    };

    const selectTab = (tabIndex) => {
      cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
        .eq(tabIndex)
        .click();
    };

    // Start test
    cy.openFieldEditModal(0, 0, 0);

    // Initial state - button should be disabled
    verifyButtonState(true);

    // Navigate to Options tab and make changes
    selectTab(1);

    // Make a change to show past dates field to trigger form changes
    cy.get('.edit-field-modal input[name="showPastDates"]')
      .check({ force: true });

    // Save button should be enabled now because we have modified a field
    verifyButtonState(false);

    // Go back to Field Information tab
    selectTab(0);

    // Clear the label field and verify save button is disabled
    cy.get('.edit-field-modal input[name="label"]')
      .as('labelField')
      .clear();

    verifyButtonState(true);

    // Add label back and verify that save button is enabled
    cy.get('@labelField')
      .type('Modified Time Picker');

    verifyButtonState(false);

    // Clear the name field and verify save button is disabled
    cy.get('.edit-field-modal input[name="name"]')
      .clear();

    verifyButtonState(true);

    cy.closeFieldEditModal();
  });

  // Test to check fields in Field Information tab
  it('should verify fields in Field Information tab', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Verify Field Information tab is selected by default
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(0)
      .should('have.class', 'bx--tabs__nav-item--selected');

    // Verify Label field exists and is a text input
    cy.get('.edit-field-modal input[name="label"]')
      .should('exist')
      .should('have.attr', 'type', 'text');

    // Verify Name field exists and is a text input
    cy.get('.edit-field-modal input[name="name"]')
      .should('exist')
      .should('have.attr', 'type', 'text');

    // Verify Help field exists and is a text area input
    cy.get('.edit-field-modal textarea[name="helperText"]')
      .should('exist');

    // Verify Dynamic checkbox exists
    cy.get('.edit-field-modal input[name="dynamic"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    cy.closeFieldEditModal();
  });

  // Test to check fields in Options tab when dynamic is off
  it('should verify fields in Options tab when dynamic is off', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Click on Options tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(1)
      .click();

    // Verify Required checkbox exists
    cy.get('.edit-field-modal input[name="required"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    // Verify Date Picker exists
    cy.get('.edit-field-modal input#date-picker-single')
      .should('exist');

    // Verify Time Picker exists
    cy.get('.edit-field-modal .bx--time-picker')
      .should('exist');

    // Verify Read Only checkbox exists
    cy.get('.edit-field-modal input[name="readOnly"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    // Verify Visible checkbox exists
    cy.get('.edit-field-modal input[name="visible"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    // Verify Show Past Dates checkbox exists
    cy.get('.edit-field-modal input[name="showPastDates"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    // Verify Fields to refresh dropdown exists
    cy.get('.edit-field-modal select[name="fieldsToRefresh"]')
      .should('exist');

    cy.closeFieldEditModal();
  });

  // Test to check fields in Options tab when dynamic is on
  it('should verify fields in Options tab when dynamic is on', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Enable dynamic option
    cy.get('.edit-field-modal input[name="dynamic"]')
      .check({ force: true });

    // Click on Options tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(1)
      .click();

    // Verify Entry Point field exists
    cy.get('.edit-field-modal input[id="automateEntryPoint"')
      .should('exist');

    // Verify Show Refresh checkbox exists
    cy.get('.edit-field-modal input[name="showRefresh"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    // Verify Show Past Dates checkbox exists
    cy.get('.edit-field-modal input[name="showPastDates"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    // Verify Fields to refresh dropdown exists
    cy.get('.edit-field-modal select[name="fieldsToRefresh"]')
      .should('exist');

    // Verify Required checkbox exists
    cy.get('.edit-field-modal input[name="required"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    cy.closeFieldEditModal();
  });

  // Test to check fields in Advanced tab
  it('should verify fields in Advanced tab', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Click on Advanced tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(2)
      .click();

    // Verify Reconfigurable checkbox exists
    cy.get('.edit-field-modal input[name="reconfigurable"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    cy.closeFieldEditModal();
  });

  // Test to check fields in Overridable Options tab when dynamic is on
  it('should verify fields in Overridable Options tab when dynamic is on', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Enable dynamic option
    cy.get('.edit-field-modal input[name="dynamic"]')
      .check({ force: true });

    // Click on Overridable Options tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(3)
      .click();

    // Verify Read Only checkbox exists
    cy.get('.edit-field-modal input[name="readOnly"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    // Verify Visible checkbox exists
    cy.get('.edit-field-modal input[name="visible"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    cy.closeFieldEditModal();
  });

  // Test to verify validation for required entry point when dynamic is on
  it('should require entry point when dynamic is on', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Set values in Field Information tab
    cy.get('.edit-field-modal input[name="label"]')
      .clear()
      .type('Dynamic Time Picker Test');

    cy.get('.edit-field-modal input[name="name"]')
      .clear()
      .type('dynamic_time_picker_test');

    // Enable dynamic option
    cy.get('.edit-field-modal input[name="dynamic"]')
      .check({ force: true });

    // Verify warning message appears
    cy.get('.edit-field-modal .bx--inline-notification__details')
      .scrollIntoView()
      .should('exist')
      .should('contain', 'Entry Point needs to be set for Dynamic elements');

    // Verify save button is disabled due to missing required entry point
    cy.get('.edit-field-modal button[type="submit"]')
      .should('be.disabled');

    cy.closeFieldEditModal();
  });

  // Test to verify time picker functionality
  it('should allow selecting a time', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Set values in Field Information tab
    cy.get('.edit-field-modal input[name="label"]')
      .clear()
      .type('Time Selection Test');

    cy.get('.edit-field-modal input[name="name"]')
      .clear()
      .type('time_selection_test');

    // Save the changes
    cy.get('.edit-field-modal button[type="submit"]')
      .click();

    // Verify the date input exists
    cy.get('.dynamic-form-field .bx--date-picker__input')
      .should('exist');

    // Verify the time input exists
    cy.get('.dynamic-form-field .bx--time-picker__input-field')
      .should('exist');

    // Enter a time in the time input
    cy.get('.dynamic-form-field .bx--time-picker__input-field')
      .clear()
      .type('10:30');

    // Verify the time was entered
    cy.get('.dynamic-form-field .bx--time-picker__input-field')
      .should('have.value', '10:30');
  });

  // Test to verify AM/PM selection
  it('should allow selecting AM/PM', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Set values in Field Information tab
    cy.get('.edit-field-modal input[name="label"]')
      .clear()
      .type('AM/PM Selection Test');

    cy.get('.edit-field-modal input[name="name"]')
      .clear()
      .type('am_pm_selection_test');

    // Save the changes
    cy.get('.edit-field-modal button[type="submit"]')
      .click();

    // Verify the AM/PM select exists
    cy.get('.dynamic-form-field .bx--select')
      .should('exist');

    // Select PM
    cy.get('.dynamic-form-field .bx--select select')
      .select('PM');

    // Verify PM was selected
    cy.get('.dynamic-form-field .bx--select select')
      .should('have.value', 'PM');
  });

  // Test to verify time validation
  it('should validate time format', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Set values in Field Information tab
    cy.get('.edit-field-modal input[name="label"]')
      .clear()
      .type('Time Validation Test');

    cy.get('.edit-field-modal input[name="name"]')
      .clear()
      .type('time_validation_test');

    // Save the changes
    cy.get('.edit-field-modal button[type="submit"]')
      .click();

    // Enter an invalid time
    cy.get('.dynamic-form-field .bx--time-picker__input-field')
      .clear()
      .type('25:70');

    // Verify the input is marked as invalid
    cy.get('.dynamic-form-field .bx--time-picker__input-field')
      .should('have.attr', 'data-invalid', 'true');

    // Verify the error message is displayed
    cy.get('.dynamic-form-field .bx--form-requirement')
      .should('be.visible')
      .should('contain', 'Enter a valid 12-hour time');

    // Enter a valid time
    cy.get('.dynamic-form-field .bx--time-picker__input-field')
      .clear()
      .type('10:30');

    // Verify the input is no longer marked as invalid
    cy.get('.dynamic-form-field .bx--time-picker__input-field')
      .should('not.have.attr', 'data-invalid');
  });

  // Test to verify combined date and time functionality
  it('should combine date and time values', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Set values in Field Information tab
    cy.get('.edit-field-modal input[name="label"]')
      .clear()
      .type('Combined Date Time Test');

    cy.get('.edit-field-modal input[name="name"]')
      .clear()
      .type('combined_date_time_test');

    // Save the changes
    cy.get('.edit-field-modal button[type="submit"]')
      .click();

    // Click on the date picker input to open the calendar
    cy.get('.dynamic-form-field .bx--date-picker__input')
      .click();

    // Verify the calendar popup appears
    cy.get('.bx--date-picker__calendar')
      .should('be.visible');

    // Select today's date
    cy.get('.bx--date-picker__calendar .dayContainer .flatpickr-day.today')
      .click();

    // Enter a time
    cy.get('.dynamic-form-field .bx--time-picker__input-field')
      .clear()
      .type('10:30');

    // Select PM
    cy.get('.dynamic-form-field .bx--select select')
      .select('PM');

    // Verify all components have values
    const today = new Date();
    const formattedDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

    cy.get('.dynamic-form-field .bx--date-picker__input')
      .should('have.value', formattedDate);

    cy.get('.dynamic-form-field .bx--time-picker__input-field')
      .should('have.value', '10:30');

    cy.get('.dynamic-form-field .bx--select select')
      .should('have.value', 'PM');
  });
});
