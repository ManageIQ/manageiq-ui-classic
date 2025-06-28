/* eslint-disable no-undef */

// user: String of username to log in with, default is admin.
// password: String of password to log in with, default is smartvm.
Cypress.Commands.add('login', (user = 'admin', password = 'smartvm') => {
  cy.session([user, password], () => {
    cy.visit('/dashboard/login');
    cy.get('#user_name').type(user);
    cy.get('#user_password').type(password);
    cy.get('#login').click();

  }, {
    validate() {
      cy.request('/api').its('status').should('eq', 200)
    },
    cacheAcrossSpecs: true
  })
  cy.visit('/utilization')
});

