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
    cy.url({ timeout: 10000 }).should('include', `/service/show/${serviceId}`);

    // Step 2: Click on Configuration dropdown
    // cy.get('#serviceForm').within(() => {
    //   cy.contains('Configuration').click();
    // });
    // cy.get('[title="Configuration"]').click();
    // cy.get('[title="Reconfigure this Service"]').click();
    cy.toolbar('Configuration', 'Reconfigure this Service');

    // Verify we're on the reconfigure page
    cy.url({ timeout: 10000 }).should('include', `/service/service_reconfigure/${serviceId}`);
    cy.get('.service-container.serviceReconfigure').should('be.visible');

    // Wait for the tabs to load
    cy.get('.bx--tabs--scrollable').should('be.visible');

    // Step 4: Edit values in the form
    // Note: These selectors are based on the actual HTML structure of service ID 25

    // Find and modify the text field (Text Box)
    cy.contains('.field-label', 'Text Box').parent().parent().find('input[type="text"]')
      .should('exist')
      .then(($input) => {
        // Check if the input is not readonly before trying to modify it
        if (!$input.prop('readonly')) {
          cy.wrap($input).clear().type('New Value');
        }
      });

    // Find and interact with the dropdown
    // cy.contains('.field-label', 'Dropdown').parent().parent().find('.bx--dropdown')
    //   .should('exist')
    //   .then(($dropdown) => {
    //     // Check if the dropdown is not disabled
    //     if (!$dropdown.prop('disabled')) {
    //       cy.wrap($dropdown).click();
    //       cy.get('.bx--dropdown-item').first().click();
    //     }
    //   });

    // Find and interact with checkboxes
    cy.contains('.field-label', 'Check Box')
      .should('exist')
      .then(($checkbox) => {
        // Check if the checkbox is not disabled
        if (!$checkbox.prop('disabled')) {
          cy.wrap($checkbox).click();
        }
      });

    // Find and interact with radio buttons
    // cy.contains('.field-label', 'Radio Button').parents('fieldset').find('input[type="radio"]').first().check();
    //   // .should('exist')
    //   // .then(($radio) => {
    //   //   // Check if the radio button is not disabled
    //   //   if (!$radio.prop('disabled')) {
    //   //     cy.wrap($radio).first().check();
    //   //   }
    //   // });

    // Step 5: Submit the form
    cy.get('.service-action-buttons').contains('button', 'Submit').click();

    // Verify loading indicator appears
    cy.get('.spinner-loading').should('be.visible');

    // Verify redirect to requests page
    cy.url({ timeout: 10000 }).should('include', '/miq_request/show_list');

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
    cy.visit(`/service/service_reconfigure/${serviceId}`);

    // Wait for the tabs to load
    cy.get('.bx--tabs--scrollable').should('be.visible');

    // Find required text fields and clear them
    cy.contains('.field-label', 'Required Text Box').parent().parent().find('input[type="text"]')
      .then(($input) => {
        // Check if the input is not readonly before trying to modify it
        if (!$input.prop('readonly')) {
          cy.wrap($input).clear();
        }
      });

    // Try to submit the form
    cy.get('.service-action-buttons').contains('button', 'Submit').click();

    // Verify validation message is shown
    cy.contains('Required').should('be.visible');

    // Verify we're still on the reconfigure page
    cy.url({ timeout: 10000 }).should('include', `/service/service_reconfigure/${serviceId}`);
  });

  it('should cancel the reconfigure process', () => {
    // Navigate directly to reconfigure page
    cy.visit(`/service/service_reconfigure/${serviceId}`);

    // Wait for the tabs to load
    cy.get('.bx--tabs--scrollable').should('be.visible');

    // Make some changes to a text field
    cy.contains('.field-label', 'Text Box').parent().parent().find('input[type="text"]')
      .then(($input) => {
        // Check if the input is not readonly before trying to modify it
        if (!$input.prop('readonly')) {
          cy.wrap($input).clear().type('Changed value that should be discarded');
        }
      });

    // Click cancel button
    cy.get('.service-action-buttons').contains('button', 'Cancel').click();

    // Verify redirect to service details
    cy.url({ timeout: 10000 }).should('include', `/service/show/${serviceId}`);

    // Verify cancel message
    cy.contains('Dialog Cancelled').should('be.visible');
  });
});
