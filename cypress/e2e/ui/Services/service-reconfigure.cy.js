// / <reference types="cypress" />

describe('Service Reconfigure Workflow for Service ID 25', () => {
  const serviceId = '25'; // Using the specific service ID 25

  beforeEach(() => {
    // Login before each test
    cy.login();
    cy.menu('Services', 'My Services');
  });

  it.only('should reconfigure the service with ID 25', () => {
    // Step 1: Navigate to the service details page
    cy.visit(`/service/show/${serviceId}`);

    // Verify we're on the service details page
    cy.url().should('include', `/service/show/${serviceId}`);

    // Step 2: Click on Configuration dropdown
    // cy.get('#serviceForm').within(() => {
    //   cy.contains('Configuration').click();
    // });
    // cy.get('[title="Configuration"]').click();
    // cy.get('[title="Reconfigure this Service"]').click();
    cy.toolbar('Configuration', 'Reconfigure this Service');

    // Verify we're on the reconfigure page
    cy.url().should('include', `/service/service_reconfigure/${serviceId}`);
    cy.get('.service-container.serviceReconfigure').should('be.visible');

    // Wait for the dialog to load
    cy.get('.dialog-content').should('be.visible');

    // Step 4: Edit values in the form
    // Note: These selectors should be updated based on the actual dialog fields in service ID 25

    // Example: Change a text field value
    cy.get('.dialog-content').within(() => {
      // Find text fields and modify them
      cy.get('input[type="text"]').first().clear().type('New Value');

      // Find dropdown fields and select new options
      cy.get('.bx--dropdown').first().click();
      cy.get('.bx--dropdown-item').first().click();

      // If there are checkboxes, toggle them
      cy.get('input[type="checkbox"]').first().click();
    });

    // Step 5: Submit the form
    cy.contains('button', 'Submit').click();

    // Verify redirect to requests page
    cy.url().should('include', '/miq_request/show_list');

    // Verify success message
    cy.contains('Request was Submitted').should('be.visible');

    // Step 6: Navigate back to the service to verify changes
    cy.visit(`/service/show/${serviceId}`);

    // Verify the service details page shows updated information
    // Note: The specific verification will depend on how the service details are displayed
    cy.get('#serviceForm').should('be.visible');
  });

  it('should validate required fields during reconfiguration', () => {
    // Navigate directly to reconfigure page
    cy.visit(`/service/reconfigure/${serviceId}`);

    // Wait for the dialog to load
    cy.get('.dialog-content').should('be.visible');

    // Find required fields and clear them
    cy.get('.dialog-content').within(() => {
      // Look for required fields (they often have an asterisk or 'required' attribute)
      cy.get('input[required]').first().clear();
    });

    // Try to submit the form
    cy.contains('button', 'Submit').click();

    // Verify validation message is shown
    cy.contains('Required').should('be.visible');
    
    // Verify we're still on the reconfigure page
    cy.url().should('include', `/service/reconfigure/${serviceId}`);
  });

  it('should cancel the reconfigure process', () => {
    // Navigate directly to reconfigure page
    cy.visit(`/service/reconfigure/${serviceId}`);

    // Wait for the dialog to load
    cy.get('.dialog-content').should('be.visible');

    // Make some changes
    cy.get('.dialog-content').within(() => {
      cy.get('input[type="text"]').first().clear().type('Changed value that should be discarded');
    });

    // Click cancel button
    cy.contains('button', 'Cancel').click();

    // Verify redirect to service details
    cy.url().should('include', `/service/show/${serviceId}`);

    // Verify cancel message
    cy.contains('Dialog Cancelled').should('be.visible');
  });
});

// Made with Bob
