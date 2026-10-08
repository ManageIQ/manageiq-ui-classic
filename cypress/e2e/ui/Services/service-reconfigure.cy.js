// / <reference types="cypress" />

// Integration test for the Service Reconfigure form.
// Requires a service with an attached reconfigure dialog to exist in the DB.
// Set the CYPRESS_RECONFIGURE_SERVICE_ID environment variable to the service's
// numeric ID before running.  Without it the suite skips.

describe('Service Reconfigure', () => {
  const serviceId = Cypress.env('RECONFIGURE_SERVICE_ID');

  before(function() {
    if (!serviceId) {
      this.skip();
    }
  });

  beforeEach(() => {
    cy.login();
  });

  it('submits the reconfigure form, creates a request, and redirects', () => {
    cy.visit(`/service/show/${serviceId}`);
    cy.toolbar('Configuration', 'Reconfigure this Service');

    cy.url({ timeout: 10000 }).should('include', `/service/service_reconfigure/${serviceId}`);
    cy.get('.service-container.serviceReconfigure').should('be.visible');
    cy.get('.cds--tabs').should('be.visible');

    cy.contains('.field-label', 'Text Box').parent().parent().find('input[type="text"]')
      .then(($input) => {
        if (!$input.prop('readonly')) {
          cy.wrap($input).clear().type('New Value');
        }
      });

    cy.get('.service-action-buttons').contains('button', 'Submit').click();

    cy.url({ timeout: 10000 }).should('include', '/miq_request/show_list');
    cy.contains('Order Request was Submitted').should('be.visible');
  });
});
