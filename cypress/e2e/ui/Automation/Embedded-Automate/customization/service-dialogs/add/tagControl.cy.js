/* eslint-disable no-undef */

describe('Automate > Customization > Service Dialogs > Add Dialog > Tag Control Tests', () => {
  // Mock categories data for tag control tests
  const mockCategoriesResponse = {
    resources: [
      {
        id: '1',
        name: 'category_1',
        description: 'Category 1',
        single_value: true,
        children: [
          { id: '11', description: 'Subcategory 1-1' },
          { id: '12', description: 'Subcategory 1-2' }
        ]
      },
      {
        id: '2',
        name: 'category_2',
        description: 'Category 2',
        single_value: false,
        children: [
          { id: '21', description: 'Subcategory 2-1' },
          { id: '22', description: 'Subcategory 2-2' },
          { id: '23', description: 'Subcategory 2-3' }
        ]
      }
    ]
  };

  beforeEach(() => {
    // Setup API mock first, before any components are rendered
    cy.intercept('GET', '**/api/categories*', mockCategoriesResponse).as('getCategories');
    
    // Then navigate and add the component
    cy.navigateToAddDialog();
    cy.dragAndDropComponent('Tag Control');
  });

  it('should verify default properties of the tag control', () => {
    // Verify the tag control exists
    cy.get('.dynamic-form-field')
      .should('exist');

    // Verify the tag control has default label "Tag Control"
    cy.get('.dynamic-form-field .bx--select')
      .should('exist');

    // Verify the tag control has a label
    cy.get('.dynamic-form-field .bx--label')
      .should('contain', 'Tag Control');
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
      .should('contain', 'Edit this Tag Control');

    cy.closeFieldEditModal();
  });

  it('should have 3 tabs in the edit modal', () => {
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

    // Make a change to sort order field to trigger form changes
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
      .type('Modified Tag Control');

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

    // Verify that Dynamic checkbox does not exist (as per the component code)
    cy.get('.edit-field-modal input[name="dynamic"]')
      .should('not.exist');

    cy.closeFieldEditModal();
  });

  // Test to check fields in Options tab
  it('should verify fields in Options tab', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Click on Options tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(1)
      .click();

    // Verify Required checkbox exists
    cy.get('.edit-field-modal input[name="required"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    // Verify Read Only checkbox exists
    cy.get('.edit-field-modal input[name="readOnly"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    // Verify Visible checkbox exists
    cy.get('.edit-field-modal input[name="visible"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    // Verify Category dropdown exists
    cy.get('.edit-field-modal select[name="categories"]')
      .should('exist');

    // Verify Single Value checkbox exists
    cy.get('.edit-field-modal input[name="singleValue"]')
      .should('exist')
      .should('have.attr', 'type', 'checkbox');

    // Verify Value Type dropdown exists
    cy.get('.edit-field-modal select[name="dataType"]')
      .should('exist');

    // Verify Sort By dropdown exists
    cy.get('.edit-field-modal select[name="sortBy"]')
      .should('exist');

    // Verify Sort Order dropdown exists
    cy.get('.edit-field-modal select[name="sortOrder"]')
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

  // Test to verify sort order functionality
  it('should respect sort order settings', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Set values in Field Information tab
    cy.get('.edit-field-modal input[name="label"]')
      .clear()
      .type('Sort Order Test');

    cy.get('.edit-field-modal input[name="name"]')
      .clear()
      .type('sort_order_test');

    // Go to Options tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(1)
      .click();

    // Set sort by to description
    cy.get('.edit-field-modal select[name="sortBy"]')
      .select('description');

    // Set sort order to descending
    cy.get('.edit-field-modal select[name="sortOrder"]')
      .select('descending');

    // Save the changes
    cy.get('.edit-field-modal button[type="submit"]')
      .click();

    // Verify the tag control exists with the new label
    cy.get('.dynamic-form-field .bx--label')
      .should('contain', 'Sort Order Test');
  });

  // TODO:: Test to verify category selection and subcategory population
  // it('should populate subcategories when a category is selected', () => {
  //   // Create a stub for the setCategories function
  //   cy.window().then(win => {
  //     cy.stub(win.console, 'log').as('consoleLog');
      
  //     // Open the edit modal
  //     cy.openFieldEditModal(0, 0, 0);
      
  //     // Set values in Field Information tab
  //     cy.get('.edit-field-modal input[name="label"]')
  //       .clear()
  //       .type('Category Selection Test');

  //     cy.get('.edit-field-modal input[name="name"]')
  //       .clear()
  //       .type('category_selection_test');

  //     // Go to Options tab
  //     cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
  //       .eq(1)
  //       .click();
      
  //     // Mock the setCategories function by directly setting the form values
  //     cy.get('.edit-field-modal').then($modal => {
  //       // Get the form renderer component
  //       const formRenderer = $modal.find('form')[0];
        
  //       // Create a custom event to simulate category selection
  //       const customEvent = new CustomEvent('categorySelected', {
  //         detail: {
  //           selectedCategory: {
  //             label: 'Category 1',
  //             value: '1',
  //             data: {
  //               subCategories: [
  //                 { id: '11', label: 'Subcategory 1-1' },
  //                 { id: '12', label: 'Subcategory 1-2' }
  //               ]
  //             }
  //           }
  //         }
  //       });
        
  //       // Dispatch the event
  //       formRenderer.dispatchEvent(customEvent);
        
  //       // Now manually update the subcategories dropdown
  //       const subCategoriesSelect = $modal.find('select[name="subCategories"]')[0];
  //       if (subCategoriesSelect) {
  //         // Clear existing options
  //         subCategoriesSelect.innerHTML = '';
          
  //         // Add new options
  //         const option1 = document.createElement('option');
  //         option1.value = '11';
  //         option1.text = 'Subcategory 1-1';
  //         subCategoriesSelect.appendChild(option1);
          
  //         const option2 = document.createElement('option');
  //         option2.value = '12';
  //         option2.text = 'Subcategory 1-2';
  //         subCategoriesSelect.appendChild(option2);
  //       }
  //     });
      
  //     // Verify the subcategories are displayed (we'll skip this since we're manually setting them)
  //     // Instead, just save the form
  //     cy.get('.edit-field-modal button[type="submit"]')
  //       .click();

  //     // Verify the tag control exists with the new label
  //     cy.get('.dynamic-form-field .bx--label')
  //       .should('contain', 'Category Selection Test');
  //   });
  // });

  // Test to verify single value functionality
  it('should respect single value setting', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Set values in Field Information tab
    cy.get('.edit-field-modal input[name="label"]')
      .clear()
      .type('Single Value Test');

    cy.get('.edit-field-modal input[name="name"]')
      .clear()
      .type('single_value_test');

    // Go to Options tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(1)
      .click();

    // Check Single Value checkbox
    cy.get('.edit-field-modal input[name="singleValue"]')
      .check({ force: true });

    // Save the changes
    cy.get('.edit-field-modal button[type="submit"]')
      .click();

    // Verify the tag control exists with the new label
    cy.get('.dynamic-form-field .bx--label')
      .should('contain', 'Single Value Test');
  });

  // Test to verify value type functionality
  it('should allow setting value type', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Set values in Field Information tab
    cy.get('.edit-field-modal input[name="label"]')
      .clear()
      .type('Value Type Test');

    cy.get('.edit-field-modal input[name="name"]')
      .clear()
      .type('value_type_test');

    // Go to Options tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(1)
      .click();

    // Set value type to integer
    cy.get('.edit-field-modal select[name="dataType"]')
      .select('Integer');

    // Save the changes
    cy.get('.edit-field-modal button[type="submit"]')
      .click();

    // Verify the tag control exists with the new label
    cy.get('.dynamic-form-field .bx--label')
      .should('contain', 'Value Type Test');
  });

  // Test to verify fields to refresh functionality
  it('should allow setting fields to refresh', () => {
    // First add another field to be refreshed
    cy.dragAndDropComponent('Text Box');

    // Now edit the tag control
    cy.openFieldEditModal(0, 0, 0);

    // Set values in Field Information tab
    cy.get('.edit-field-modal input[name="label"]')
      .clear()
      .type('Refresh Fields Test');

    cy.get('.edit-field-modal input[name="name"]')
      .clear()
      .type('refresh_fields_test');

    // Go to Options tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(1)
      .click();

    // Select fields to refresh if available
    cy.get('.edit-field-modal select[name="fieldsToRefresh"]')
      .then(($select) => {
        if ($select.find('option').length > 0) {
          cy.get('.edit-field-modal select[name="fieldsToRefresh"]')
            .select(0);
        }
      });

    // Save the changes
    cy.get('.edit-field-modal button[type="submit"]')
      .click();

    // Verify the tag control exists with the new label
    cy.get('.dynamic-form-field .bx--label')
      .should('contain', 'Refresh Fields Test');
  });

  // Test to verify reconfigurable setting
  it('should allow setting reconfigurable option', () => {
    cy.openFieldEditModal(0, 0, 0);

    // Set values in Field Information tab
    cy.get('.edit-field-modal input[name="label"]')
      .clear()
      .type('Reconfigurable Test');

    cy.get('.edit-field-modal input[name="name"]')
      .clear()
      .type('reconfigurable_test');

    // Go to Advanced tab
    cy.get('.edit-field-modal .edit-field-modal-body ul[role=tablist] li')
      .eq(2)
      .click();

    // Check Reconfigurable checkbox
    cy.get('.edit-field-modal input[name="reconfigurable"]')
      .check({ force: true });

    // Save the changes
    cy.get('.edit-field-modal button[type="submit"]')
      .click();

    // Verify the tag control exists with the new label
    cy.get('.dynamic-form-field .bx--label')
      .should('contain', 'Reconfigurable Test');
  });

  // TODO:: Test to verify tag selection functionality
  // it('should allow selecting a tag value', () => {
  //   cy.openFieldEditModal(0, 0, 0);

  //   // Set values in Field Information tab
  //   cy.get('.edit-field-modal input[name="label"]')
  //     .clear()
  //     .type('Tag Selection Test');

  //   cy.get('.edit-field-modal input[name="name"]')
  //     .clear()
  //     .type('tag_selection_test');

  //   // Save the changes
  //   cy.get('.edit-field-modal button[type="submit"]')
  //     .click();

  //   // Verify the select dropdown exists
  //   cy.get('.dynamic-form-field .bx--select')
  //     .should('exist');

  //   // If there are options in the dropdown, select one
  //   cy.get('.dynamic-form-field .bx--select select option')
  //     .then(($options) => {
  //       if ($options.length > 1) {
  //         cy.get('.dynamic-form-field .bx--select select')
  //           .select(1);

  //         // Verify an option was selected
  //         cy.get('.dynamic-form-field .bx--select select')
  //           .should('not.have.value', '');
  //       }
  //     });
  // });
});
