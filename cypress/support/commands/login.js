// cy.login() - log in
// FIXME: use cy.request and inject cookie and localStorage.miqToken
Cypress.Commands.add("login", (user = 'admin', password = 'smartvm') => {
  cy.visit('/');

  cy.get('#user_name').type(user);
  cy.get('#user_password').type(password);
  return cy.get('#login').click();
});

