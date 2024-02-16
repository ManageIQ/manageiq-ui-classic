/* eslint-disable no-undef */

// user: String of username to log in with, default is admin.
// password: String of password to log in with, default is smartvm.
Cypress.Commands.add('login', (user = 'admin', password = 'smartvm') => {
  cy.visit('/');

  cy.get('#user_name').type(user);
  cy.get('#user_password').type(password);
  return cy.get('#login').click();
});

