/* eslint-disable no-undef */

describe('Automation > Embedded Automate > Customization > Service Dialogs > Form Submission', () => {
  const dialogName = 'Test Dialog ' + Date.now();
  const dialogDescription = 'Test Dialog Description for automated testing';

  beforeEach(() => {
    cy.navigateToAddDialog();
    // cy.closeNotificationsIfVisible();
  });

  it('should create a service dialog with multiple tabs and sections, then verify it appears in the list', () => {
    // Step 1: Set dialog name and description
    cy.get('#dialogName').type(dialogName);
    cy.get('#dialogDescription').type(dialogDescription);

    cy.closeNotificationsIfVisible();

    // Step 2: Configure the first tab
    cy.clickTab(0);
    cy.openTabMenu(0);
    cy.openEditTabModal();
    cy.editTabAndSubmit('First Tab', 'This is the first tab');

    // Step 3: Configure the first section in the first tab
    cy.openEditSectionModal(0, 0);
    cy.editSectionAndSubmit('First Section', 'This is the first section');

    cy.closeNotificationsIfVisible();

    // Step 4: Add a text box to the first section
    cy.dragAndDropComponent('Text Box');
    cy.openFieldEditModal(0, 0, 0);
    cy.get('.edit-field-modal input[name="label"]').clear().type('Text Field 1');
    cy.get('.edit-field-modal input[name="name"]').clear().type('text_field_1');
    
    // Go to Options tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li').eq(1).click();
    
    // Make it required
    cy.get('.edit-field-modal input[name="required"]').check({ force: true });
    
    // Save the field
    cy.get('.edit-field-modal button[type="submit"]').click();

    // Step 5: Add a second tab
    cy.addTab();
    cy.clickTab(1);
    cy.openTabMenu(1);
    cy.openEditTabModal();
    cy.editTabAndSubmit('Second Tab', 'This is the second tab');

    // Step 6: Add a section to the second tab
    cy.addSection();
    cy.openEditSectionModal(1, 0);
    cy.editSectionAndSubmit('Second Section', 'This is the second section');

    // Step 7: Add a dropdown to the second section
    cy.dragAndDropComponent('Dropdown');
    cy.openFieldEditModal(1, 0, 0);
    cy.get('.edit-field-modal input[name="label"]').clear().type('Dropdown Field');
    cy.get('.edit-field-modal input[name="name"]').clear().type('dropdown_field');
    
    // Go to Options tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li').eq(1).click();
    
    // Add dropdown values
    cy.get('.edit-field-modal button').contains('Add Value').click();
    cy.get('.edit-field-modal input[name="values[0].label"]').type('Option 1');
    cy.get('.edit-field-modal input[name="values[0].value"]').type('option_1');
    
    cy.get('.edit-field-modal button').contains('Add Value').click();
    cy.get('.edit-field-modal input[name="values[1].label"]').type('Option 2');
    cy.get('.edit-field-modal input[name="values[1].value"]').type('option_2');
    
    // Save the field
    cy.get('.edit-field-modal button[type="submit"]').click();

    // Step 8: Add a tag control to the second section
    cy.dragAndDropComponent('Tag Control');
    cy.openFieldEditModal(1, 0, 1);
    cy.get('.edit-field-modal input[name="label"]').clear().type('Tag Field');
    cy.get('.edit-field-modal input[name="name"]').clear().type('tag_field');
    
    // Save the field
    cy.get('.edit-field-modal button[type="submit"]').click();

    // Step 9: Add a third tab with a section and checkbox
    cy.addTab();
    cy.clickTab(2);
    cy.openTabMenu(2);
    cy.openEditTabModal();
    cy.editTabAndSubmit('Third Tab', 'This is the third tab');

    // Add a section to the third tab
    cy.addSection();
    cy.openEditSectionModal(2, 0);
    cy.editSectionAndSubmit('Third Section', 'This is the third section');

    // Add a checkbox to the third section
    cy.dragAndDropComponent('Check Box');
    cy.openFieldEditModal(2, 0, 0);
    cy.get('.edit-field-modal input[name="label"]').clear().type('Checkbox Field');
    cy.get('.edit-field-modal input[name="name"]').clear().type('checkbox_field');
    
    // Go to Options tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li').eq(1).click();
    
    // Set default value to true
    cy.get('.edit-field-modal input[name="defaultValue"]').check({ force: true });
    
    // Save the field
    cy.get('.edit-field-modal button[type="submit"]').click();

    // Step 10: Save the dialog
    cy.get('button').contains('Save').click();

    // Step 11: Verify the dialog appears in the list
    cy.get('.flash-messages .flash_text_success')
      .should('contain', 'Dialog "' + dialogName + '" was added');

    // Verify the dialog is in the list
    cy.get('#miq-gtl-view').should('exist');
    cy.get('.miq-data-table').should('exist');
    
    // Search for the dialog by name
    cy.get('#search_text').type(dialogName);
    cy.get('#searchicon').click();
    
    // Verify the dialog appears in the search results
    cy.get('.miq-data-table .table-view-pf-select')
      .should('exist')
      .parent()
      .should('contain', dialogName);
  });
});

// Made with Bob
