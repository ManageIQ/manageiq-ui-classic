// eslint-disable-next-line no-undef
describe('Service Dialog Edit', () => {
  // Reusable function to create a service dialog with fields
  const createServiceDialog = (dialogName) => {
    cy.navigateToAddDialog();
    cy.get('#dialogName').type(dialogName);
    cy.get('#dialogDescription').type('Dialog description');
    cy.dragAndDropComponent('Text Box');
    cy.openFieldEditModal(0, 0, 0);

    // Set values in Field Information tab
    cy.get('.edit-field-modal input[name="label"]')
      .clear()
      .type('Text Field');

    // Switch to Options tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(1)
      .click();
    cy.get('.edit-field-modal input[name="value"]')
      .clear()
      .type('Initial Value');

    // Save the changes
    cy.get('.edit-field-modal button[type="submit"]')
      .click();

    // Add a checkbox field
    cy.dragAndDropComponent('Check Box');
    cy.openFieldEditModal(0, 0, 1);
    // Set a value in the Field Information tab
    cy.get('.edit-field-modal input[name="label"]')
      .clear()
      .type('Custom Label');

    // Switch to Options tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(1)
      .click();

    // Set a value in the Options tab
    cy.get('.edit-field-modal label[for="checked"]').click();

    // Save the changes
    cy.get('.edit-field-modal button[type="submit"]')
      .click();

    // Step 10: Save the dialog
    cy.get('.service-dialog-main-wrapper .custom-button-wrapper button').contains('Submit').click();

    // Verify we're back at the explorer page and the dialog was created
    cy.url().should('include', '/miq_ae_customization/explorer');
    
    // Use selectAccordionItem to navigate to All Dialogs
    cy.selectAccordionItem([
      /^All Dialogs/,
      dialogName,
    ]);
    
    return dialogName;
  };

  // Clean up dialogs created during tests
  const deleteDialog = (dialogName) => {
    cy.selectAccordionItem([
      /^All Dialogs/,
      dialogName,
    ]);

    cy.expect_browser_confirm_with_text({
      containsText: 'Warning: This Dialog will be permanently removed!',
      proceed: true,
      confirmTriggerFn: () => {
        return cy.toolbar('Configuration', 'Remove Dialog');
      },
    });
        
    // Verify the dialog was deleted
    cy.get('.flash_text_div .alert-success')
      .should('contain', 'Dialog "Test Dialog": Delete successful');
  };

  beforeEach(() => {
    cy.login();
  });
  
  // Clean up after each test
  afterEach(function() {
    deleteDialog('Test Dialog');
  });

  it('should create a service dialog with fields and verify edit functionality', function() {
    // Create a unique dialog name
    const dialogName = 'Test Dialog';

    // Create the service dialog
    createServiceDialog(dialogName);

    // Navigate to edit the dialog
    cy.toolbar('Configuration', 'Edit this Dialog');

    // Verify field values are displayed correctly
    cy.get('.dynamic-form-field').contains('Text Field').parent().find('input').should('have.value', 'Initial Value');
    cy.get('.dynamic-form-field').contains('Custom Label').parent().find('input[type="checkbox"]').should('be.checked');

    // Make changes to the fields
    cy.openFieldEditModal(0, 0, 0);
    
    // Switch to Options tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(1)
      .click();
    cy.get('.edit-field-modal input[name="value"]').clear().type('Updated Value');
    cy.get('.edit-field-modal button[type="submit"]').click();

    cy.openFieldEditModal(0, 0, 1);
    
    // Switch to Options tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(1)
      .click();
    cy.get('.edit-field-modal label[for="checked"]').click();
    cy.get('.edit-field-modal button[type="submit"]').click();

    // Submit the form to save changes
    cy.get('button[type="submit"]').contains('Submit').click();

    // Verify we're back at the explorer page
    cy.url().should('include', '/miq_ae_customization/explorer');

    // Navigate back to edit to verify persistence
    cy.toolbar('Configuration', 'Edit this Dialog');

    // Verify updated values
    cy.get('.dynamic-form-field').contains('Text Field').parent().find('input').should('have.value', 'Updated Value');
    cy.get('.dynamic-form-field').contains('Custom Label').parent().find('input[type="checkbox"]').should('not.be.checked');

    cy.get('button[type="button"]').contains('Cancel').click();
  });

  it('should navigate back to explorer when Cancel button is clicked', function() {
    // Create a unique dialog name
    const dialogName = 'Test Dialog';

    // Create the service dialog
    createServiceDialog(dialogName);

    // Navigate to edit page for the dialog
    cy.toolbar('Configuration', 'Edit this Dialog');

    // Make a change that shouldn't be saved
    cy.openFieldEditModal(0, 0, 0);
    cy.get('.edit-field-modal input[name="label"]')
      .clear()
      .type('Text Field Edited');
    cy.get('.edit-field-modal button[type="submit"]')
      .click();

    // Click Cancel button
    cy.get('button').contains('Cancel').click();

    // Verify we're back at the explorer page
    cy.url().should('include', '/miq_ae_customization/explorer');

    // Verify the dialog name wasn't changed
    cy.toolbar('Configuration', 'Edit this Dialog');
    cy.openFieldEditModal(0, 0, 0);
    cy.get('.edit-field-modal input[name="label"]')
      .should('not.contain', 'Field Edited');
    cy.closeFieldEditModal();
    cy.get('button[type="button"]').contains('Cancel').click();
  });
});

