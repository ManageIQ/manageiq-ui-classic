/* eslint-disable no-undef */

describe('Settings > Application Settings > Replication', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('POST', '/ops/accordion_select?id=rbac_accord').as('accordion');
    cy.menu('Settings', 'Application Settings');
    cy.get('[data-nodeid="0.0"].node-treeview-settings_tree').contains('ManageIQ Region').click();
    cy.get('#explorer_title_text');
  });

  describe('Settings Replication Tab', () => {
    beforeEach(() => {
      // Click the Replication tab
      cy.get('#settings_dynamic .bx--tabs--scrollable__nav-item')
        .contains('Replication')
        .click({force: true});
    });

    it('should display the replication type dropdown and select options', () => {
      // Check if the dropdown exists and is visible
      cy.get('select[name="replication_type"]', { delay: 10000 }).should('exist').and('be.visible');
      // Check if the dropdown has the correct options
      cy.get('select[name="replication_type"] option').should('have.length', 3);
      cy.get('select[name="replication_type"] option[value="none"]').should('exist');
      cy.get('select[name="replication_type"] option[value="global"]').should('exist');
      cy.get('select[name="replication_type"] option[value="remote"]').should('exist');

      // Select "Global" in the dropdown
      cy.get('select[name="replication_type"]').select('global', {force: true});
      // Check that "Add Subscription" button is visible for global type
      cy.get('button').contains('Add Subscription');

      // Click on Add subscription and see if modal is visible
      cy.get('button').contains('Add Subscription').click();
      cy.get('.bx--modal').should('be.visible');
      cy.get('.bx--modal-header__heading').should('have.text', 'Add Subscription');

      // Click cancel button in the modal
      cy.get('.bx--modal button').contains('Cancel').click();
      cy.get('.bx--modal').should('not.be.visible');

      // Open the modal again
      cy.get('button').contains('Add Subscription').click();
      cy.get('.bx--modal').should('be.visible');

      // Check if the modal contains the required fields
      cy.get('input[name="dbname"]').scrollIntoView().should('be.visible');
      cy.get('input[name="host"]').should('be.visible');
      cy.get('input[name="user"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="port"]').should('be.visible');

      // Check that the Validate button is initially disabled
      cy.get('.bx--modal button').contains('Validate').should('be.disabled');

      // Check that the Accept button is initially disabled
      cy.get('.bx--modal button').contains('Accept').should('be.disabled');

      // Type into the fields
      cy.get('input[name="dbname"]').type('test_db');
      cy.get('input[name="host"]').type('localhost');
      cy.get('input[name="user"]').type('user1');
      cy.get('input[name="password"]').type('12345');
      cy.get('input[name="port"]').type('8888');

      // Check that the validate button is now enabled
      cy.get('.bx--modal button').contains('Validate').should('not.be.disabled');

      // Click Validate
      cy.get('.bx--modal button').contains('Validate').click();

      // Verify that the Accept button is now enabled in the modal
      cy.get('.bx--modal button').contains('Accept').should('not.be.disabled');

      // Click the Reset button
      cy.get('.bx--modal button').contains('Reset').should('be.visible').click();

      // Assert that the fields are reset
      cy.get('input[name="dbname"]').should('have.value', '');
      cy.get('input[name="host"]').should('have.value', '');
      // cy.get('input[name="user"]').should('have.value', 'admin');

      // Checks that there is a flash message after reset
      cy.get('#flash_msg_div')
        .find('.alert-warning') // Covers multiple cases
        .should('be.visible')
        .and('contain.text', 'All changes have been reset');

      // Close the modal when clicking anywhere outside the modal
      cy.get('body').click(0, 0);
      cy.get('.bx--modal').should('not.be.visible');

      //
      //

      // Save Remote type

      // Select "Remote" in the dropdown
      cy.get('select[name="replication_type"]').select('remote');
      // Click save button
      cy.get('button').contains('Save').click();
      // Check that there is a flash message after save
      cy.get('#flash_msg_div')
        .find('.alert-success')
        .should('be.visible')
        .and('contain.text', 'Replication configuration save initiated. Check status of task "Configure the database to be a replication remote region" on My Tasks screen');

      // Save None type

      // Select "None" in the dropdown
      cy.get('select[name="replication_type"]').select('none');
      // Check that there is a flash message after selecting None (when Remote was the previously selected type)
      cy.get('#flash_msg_div')
        .find('.alert-warning')
        .should('be.visible')
        .and('contain.text', 'Replication will be disabled for this region');
      // Click save button
      cy.get('button').contains('Save').click();
      // Check that there is a flash message after save
      cy.get('#flash_msg_div')
        .find('.alert-warning')
        .should('be.visible')
        .and('contain.text', 'No replication role has been set');

      // Verify Reset
      cy.get('select[name="replication_type"]').select('remote');
      cy.get('button').contains('Reset').click();
      // Check that there is a flash message after reset
      cy.get('#flash_msg_div')
        .find('.alert-warning')
        .should('be.visible')
        .and('contain.text', 'No replication role has been set');

      // Save global type

      cy.get('select[name="replication_type"]').select('global');
      // check for a flash message stating minimum required subscription count
      cy.get('#flash_msg_div')
        .find('.alert-warning')
        .should('be.visible')
        .and('contain.text', 'At least 1 subscription must be added to save server replication type');
      // Click on add subscription
      cy.get('button').contains('Add Subscription').click();
      cy.get('.bx--modal').should('be.visible');
      cy.get('.bx--modal-header__heading').should('have.text', 'Add Subscription');
      // Type into the fields
      cy.get('input[name="dbname"]')
        .clear({ force: true }) // Ensure it fully clears
        .type('test_db', { force: true, delay: 100 }) // Slow down typing
        .should('have.value', 'test_db'); // Verify the full text is entered
      cy.get('input[name="host"]').type('localhost');
      cy.get('input[name="user"]').type('user1');
      cy.get('input[name="password"]').type('12345');
      cy.get('input[name="port"]').type('8888');
      // Click Validate
      cy.get('.bx--modal button').contains('Validate').should('be.visible').click({force: true});
      // Verify that the Accept button is now enabled in the modal
      cy.get('.bx--modal button').contains('Accept').should('be.visible').click();

      // Checks that the new subscription is visible in the UI
      cy.get('.subscriptions-table')
        .find('table')
        .find('tbody')
        .find('tr')
        .should('have.length', 1);

      // Update a subscription
      cy.get('.miq-data-table .miq-data-table-button').contains('Update').should('be.visible').click();
      cy.get('.bx--modal').should('be.visible');
      cy.get('.bx--modal-header__heading').should('have.text', 'Edit test_db');
      // Edit a field in the modal
      cy.get('input[name="user"]')
        .clear({ force: true }) // Ensure it fully clears
        .type('user2', { force: true, delay: 100 }) // Slow down typing
        .should('have.value', 'user2'); // Verify the full text is entered
      // Click Validate
      cy.get('.bx--modal button').contains('Validate').should('be.visible').click({force: true});
      // Verify that the Accept button is now enabled in the modal
      cy.get('.bx--modal button').contains('Accept').should('be.visible').click();
      // Check that edited value is reflected in the UI
      cy.get('.subscriptions-table')
        .find('table')
        .find('tbody')
        .find('tr')
        .find('td')
        .eq(2) // Select the 3rd <td> (0-based index)
        .should('have.text', 'user2');

      // Delete a subscription
      cy.get('.miq-data-table .miq-data-table-button').contains('Delete').should('be.visible').click();
      // Checks that the subscription is removed from the UI
      cy.get('.subscriptions-table')
        .find('table')
        .find('tbody')
        .find('tr')
        .should('have.length', 0);


      // ToDO - Save subscription
      // ToDO - Check that there is a flash message after save
      // ToDO - Remove subscriptions when another type is saved
    });
  });
});
