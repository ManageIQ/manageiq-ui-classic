describe('GTL', () => {
  beforeEach(() => {
    cy.login();
  });

  it("with data", () => {
    cy.menu("Configuration", "Providers");
    cy.toolbar('Configuration', 'Add a new Provider');
  });
});
