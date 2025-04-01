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
      cy.get('select[name="replication_type"]').should('be.visible');
      // Check if the dropdown has the correct options
      cy.get('select[name="replication_type"] option').should('have.length', 3);
      cy.get('select[name="replication_type"] option[value="none"]').should('exist');
      cy.get('select[name="replication_type"] option[value="global"]').should('exist');
      cy.get('select[name="replication_type"] option[value="remote"]').should('exist');

      // Select "Global" in the dropdown
      cy.get('select[name="replication_type"]').select('global');
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
      cy.get('input[name="dbname"]').should('be.visible');
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

      // Verify that the Accept button is now enabled
      cy.get('.bx--modal button').contains('Accept').should('not.be.disabled');

      // Click the Reset button
      cy.get('.bx--modal button').contains('Reset').should('be.visible').click();

      // Assert that the fields are reset
      cy.get('input[name="dbname"]').should('have.value', '');
      cy.get('input[name="host"]').should('have.value', '');
      // cy.get('input[name="user"]').should('have.value', 'admin');

      // Checks that there is a flash message after reset
      cy.get('#flash_msg_div')
        .find('.alert-warning, .alert') // Covers multiple cases
        .should('be.visible')
        .and('contain.text', 'All changes have been reset');

      // Close the modal when clicking anywhere outside the modal
      cy.get('body').click(0, 0);
      cy.get('.bx--modal').should('not.be.visible');
    });
  });
});
