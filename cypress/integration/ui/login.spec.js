/// <reference types="Cypress" />

describe('Login', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  // do not use cy.login() here
  it("login page", () => {
    cy.get('#user_name')
      .type("admin");
    cy.get('#user_password')
      .type("smartvm");
    cy.get('#login').click();

    cy.get(".navbar-brand-name");
  });
});
