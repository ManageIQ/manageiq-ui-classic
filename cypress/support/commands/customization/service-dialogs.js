/* eslint-disable no-undef */

// Drag and drop a component to a section
Cypress.Commands.add('dragAndDropComponent', (componentName, targetSectionIndex = 0) => {
  // Find the component in the component list
  cy.get('.components-list-wrapper .component-item-wrapper')
    .contains(componentName)
    .as('componentSource');
  
  // Find the target section
  cy.get('.dynamic-section')
    .eq(targetSectionIndex)
    .as('targetSection');
  
  // Perform drag and drop operation
  cy.get('@componentSource')
    .trigger('dragstart');
  
  cy.get('@targetSection')
    .trigger('dragover')
    .trigger('drop');
  
  // Verify the component was added to the section
  cy.get('@targetSection')
    .find('.dynamic-form-field-wrapper')
    .should('exist');
});

// Login and navigate to add a new service dialog
Cypress.Commands.add('navigateToAddDialog', () => {
  cy.login();
  cy.intercept('POST', '/ops/accordion_select?id=dialogs_accord'); // May not be needed; added to check the server error shown sometimes
  cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
  cy.menu('Automation', 'Embedded Automate', 'Customization');

  cy.closeNotificationsIfVisible();
  cy.closeErrorPopupIfVisible();

  // Select Service Dialogs for configuration
  cy.accordion('Service Dialogs');
  cy.get('#dialogs_accord')
    .find('.list-group .list-group-item').contains('All Dialogs').click();

  cy.toolbar('Configuration', 'Add a new Dialog');
});

// Add a tab
Cypress.Commands.add('addTab', () => {
  cy.get('#dynamic-tabs ul li').last().find('button').contains('Create Tab').click();
});

// Delete a tab by index
Cypress.Commands.add('deleteTab', (index) => {
  cy.get('.dynamic-tab-name').find(`#tab-menu-${index}`).click()
    .then(() => {
      cy.get('ul[aria-label="Tab options"]')
        .find('li').find('button[aria-label="Remove Tab"]').click();
    });
});

// Click the nth tab (default = 0)
Cypress.Commands.add('clickTab', (index = 0) => {
  cy.get('#dynamic-tabs ul li').eq(index).click();
});

// Open tab options by tab index
Cypress.Commands.add('openTabMenu', (index = 0) => {
  cy.get(`.dynamic-sections-wrapper .dynamic-tab-name #tab-menu-${index}`).click();
});

// Open the Edit Tab modal
Cypress.Commands.add('openEditTabModal', () => {
  cy.get('ul[aria-label="Tab options"]')
    .find('li').find('button[aria-label="Edit Tab"]').click();
});

// Edit and submit the changes on tab
Cypress.Commands.add('editTabAndSubmit', (tabName, tabDescription) => {
  cy.get('.edit-tab-modal').within(() => {
    cy.get('input[name="tab_name"]').clear().type(tabName);
    cy.get('textarea[name="tab_description"]').clear().type(tabDescription);
    cy.get('button[type="submit"]').click();
  });
});

// Edit but cancel the changes on tab
Cypress.Commands.add('editTabAndCancel', (tabName) => {
  cy.get('.edit-tab-modal').within(() => {
    cy.get('input[name="tab_name"]').clear().type(tabName);
    cy.get('button').contains('Cancel').click();
  });
});

// Delete a section
Cypress.Commands.add('deleteSection', (tabIndex, secIndex) => {
  cy.get(`#dynamic-tab-${tabIndex}-section-${secIndex} .dynamic-section-actions`)
    .find('button[title="Remove section"]').click();
});

// Add a new section
Cypress.Commands.add('addSection', () => {
  cy.get('.dynamic-sections-wrapper .add-section-button-wrapper')
    .find('.add-section-button').click();
});

// Click the edit button on a section
Cypress.Commands.add('openEditSectionModal', (tabIndex, secIndex) => {
  cy.get(`#dynamic-tab-${tabIndex}-section-${secIndex} .dynamic-section-actions`)
    .find('button[title="Edit section"]').click();
});

// Edit and submit the changes on section
Cypress.Commands.add('editSectionAndSubmit', (secName, secDescription) => {
  cy.get('.edit-section-modal').within(() => {
    cy.get('input[name="section_name"]').clear().type(secName);
    cy.get('textarea[name="section_description"]').clear().type(secDescription);
    cy.get('button[type="submit"]').click();
  });
});

// Edit but cancel the changes on section
Cypress.Commands.add('editSectionAndCancel', (name) => {
  cy.get('.edit-section-modal').within(() => {
    cy.get('input[name="section_name"]').clear().type(name);
    cy.contains('button', 'Cancel').click();
  });
});

Cypress.Commands.add('enterDialogNameAndDescription', () => {
  cy.get('#dialogName').type('Test Dialog');
  cy.get('#dialogDescription').type('Test Dialog Description');
});

// Make field action buttons visible and click edit button
Cypress.Commands.add('openFieldEditModal', (tabIndex = 0, sectionIndex = 0, fieldIndex = 0) => {
  // Force display of the action buttons by using invoke to set display style
  cy.get(`#dynamic-tab-${tabIndex}-section-${sectionIndex}`)
    .find('.dynamic-form-field')
    .eq(fieldIndex)
    .find('.dynamic-form-field-actions')
    .invoke('attr', 'style', 'display: flex !important');
  
  // Open the edit modal for the dynamic field
  cy.get(`#dynamic-tab-${tabIndex}-section-${sectionIndex}`)
    .find('.dynamic-form-field')
    .eq(fieldIndex)
    .find('.dynamic-form-field-actions button')
    .first()
    .click({ force: true });
  
  // Verify the modal is open
  cy.get('.edit-field-modal')
    .should('exist');

  cy.closeNotificationsIfVisible();
});

// Close the edit modal
Cypress.Commands.add('closeFieldEditModal', () => {
  cy.get('.edit-field-modal button')
    .contains('Cancel')
    .click();
});


// Remove a field
Cypress.Commands.add('removeField', (tabIndex = 0, sectionIndex = 0, fieldIndex = 0) => {
  // Force display of the action buttons
  cy.get(`#dynamic-tab-${tabIndex}-section-${sectionIndex}`)
    .find('.dynamic-form-field')
    .eq(fieldIndex)
    .find('.dynamic-form-field-actions')
    .invoke('attr', 'style', 'display: flex !important');
  
  // Click the remove button with force option
  cy.get(`#dynamic-tab-${tabIndex}-section-${sectionIndex}`)
    .find('.dynamic-form-field')
    .eq(fieldIndex)
    .find('.dynamic-form-field-actions button')
    .last()
    .click({ force: true });
});
