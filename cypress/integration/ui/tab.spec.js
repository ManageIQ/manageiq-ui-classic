/// <reference types="Cypress" />

describe('Login', () => {
  beforeEach(() => {
    cy.login();
  });

  it("switch tab correctly", () => {
    cy.menu("Services", "Catalogs");
    cy.accordion('Catalog Items');
    cy.toolbar('Configuration', 'Add a New Catalog Item');
    cy.get("#form_div > div.form-horizontal > div > div > div > button").contains("Choose").click();
    cy.get("#form_div > div.form-horizontal > div > div > div > div > ul a").contains("Red Hat Virtualization").click();
    cy.tab("Request Info");
    cy.tab("Schedule");
    cy.tab("Customize");
    cy.tab("Network");
    cy.tab("Hardware");
    cy.tab("Environment");
    cy.tab("Catalog");
  });
});
