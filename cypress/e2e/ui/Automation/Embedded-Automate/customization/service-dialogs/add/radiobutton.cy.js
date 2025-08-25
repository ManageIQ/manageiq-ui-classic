/* eslint-disable no-undef */

describe('Automate > Customization > Service Dialogs > Add Dialog > Radio Button Tests', () => {
  beforeEach(() => {
    cy.navigateToAddDialog();
    cy.dragAndDropComponent('Radio Button');
  });

  it('should verify default properties of the radio button', () => {
    // Verify the radio button exists
    cy.get('.dynamic-form-field')
      .should('exist');

    // Verify the radio button has default label "Radio Button"
    cy.get('.dynamic-form-field .bx--radio-button-group')
      .should('exist');

    // Verify the radio button group has a legend
    cy.get('.dynamic-form-field .bx--radio-button-group legend')
      .should('contain', 'Radio Button group');
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
      .should('contain', 'Edit this Radio Button');

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

    // Make a change to the sortOrder field to trigger form changes
    cy.get('.edit-field-modal select[name="sortOrder"]')
      .select('descending');

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
      .type('Modified Label');

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

    // Verify Read Only switch exists
    cy.get('.edit-field-modal input[name="readOnly"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    // Verify Visible switch exists
    cy.get('.edit-field-modal input[name="visible"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    // Verify Required switch exists
    cy.get('.edit-field-modal input[name="required"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    // Verify Default Value field exists
    cy.get('.edit-field-modal select[name="value"]')
      .should('exist');

    // Verify Value Type field exists
    cy.get('.edit-field-modal select[name="dataType"]')
      .should('exist');

    // Verify Sort By field exists
    cy.get('.edit-field-modal select[name="sortBy"]')
      .should('exist');

    // Verify Sort Order field exists
    cy.get('.edit-field-modal select[name="sortOrder"]')
      .should('exist');

    // Verify Entries field exists
    cy.get('.edit-field-modal button[id="add-items"]')
      .should('exist');

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

    // Verify Load Values on Init checkbox exists
    cy.get('.edit-field-modal input[name="loadOnInit"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    // Verify Required checkbox exists
    cy.get('.edit-field-modal input[name="required"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    // Verify Value Type field exists
    cy.get('.edit-field-modal select[name="dataType"]')
      .should('exist');

    // Verify Fields to refresh dropdown exists
    cy.get('.edit-field-modal select[name="fieldsToRefresh"]')
      .should('exist');

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

    // Verify Sort By field exists
    cy.get('.edit-field-modal select[name="sortBy"]')
      .should('exist');

    // Verify Sort Order field exists
    cy.get('.edit-field-modal select[name="sortOrder"]')
      .should('exist');

    cy.closeFieldEditModal();
  });

  // Test to verify validation for required entry point when dynamic is on
  it('should require entry point when dynamic is on', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Set values in Field Information tab
    cy.get('.edit-field-modal input[name="label"]')
      .clear()
      .type('Dynamic Radio Button Test');

    cy.get('.edit-field-modal input[name="name"]')
      .clear()
      .type('dynamic_radio_button_test');

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

  // Test to verify radio button sorting
  it('should sort radio button items by description', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Set values in Field Information tab
    cy.get('.edit-field-modal input[name="label"]')
      .clear()
      .type('Sorted Radio Buttons');

    cy.get('.edit-field-modal input[name="name"]')
      .clear()
      .type('sorted_radio_buttons');

    // Switch to Options tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(1)
      .click();

    // Set sort by to description (default)
    cy.get('.edit-field-modal select[name="sortBy"]')
      .select('description');

    // Set sort order to ascending (default)
    cy.get('.edit-field-modal select[name="sortOrder"]')
      .select('ascending');

    // Save the changes
    cy.get('.edit-field-modal button[type="submit"]')
      .click();

    // Verify radio buttons are displayed
    cy.get('.dynamic-form-field .bx--radio-button')
      .should('exist');
  });

  // Test to verify adding and removing radio button entries
  it.only('should allow adding and removing radio button entries', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Set values in Field Information tab
    cy.get('.edit-field-modal input[name="label"]')
      .clear()
      .type('Radio Button Entries Test');

    cy.get('.edit-field-modal input[name="name"]')
      .clear()
      .type('radio_button_entries_test');

    // Switch to Options tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(1)
      .click();

    // Add a new entry
    cy.get('.edit-field-modal button[id="add-items"]')
      .click();

    // Fill in the new entry fields
    cy.get('.edit-field-modal input[name^="items["][name$="].text"]')
      .last()
      .clear()
      .type('New Radio Option');

    cy.get('.edit-field-modal input[name^="items["][name$="].id"]')
      .last()
      .clear()
      .type('new_radio_option');

    // Save the changes
    cy.get('.edit-field-modal button[type="submit"]')
      .click();

    // Verify the new radio button exists
    cy.get('.dynamic-form-field .bx--radio-button-group')
      .find('.bx--radio-button__label')
      .contains('New Radio Option')
      .should('exist');
  });

  // Test to verify radio button selection
  it('should allow selecting a radio button option', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Set values in Field Information tab
    cy.get('.edit-field-modal input[name="label"]')
      .clear()
      .type('Selection Test');

    cy.get('.edit-field-modal input[name="name"]')
      .clear()
      .type('selection_test');

    // Save the changes
    cy.get('.edit-field-modal button[type="submit"]')
      .click();

    // Select the first radio button option
    cy.get('.dynamic-form-field .bx--radio-button__label')
      .first()
      .click();

    // Verify the radio button is selected
    cy.get('.dynamic-form-field .bx--radio-button')
      .first()
      .should('be.checked');
  });
});

