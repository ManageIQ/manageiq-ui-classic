describe('GTL', () => {
  beforeEach(() => {
    cy.login();
  });

  it("with data", () => {
    cy.menu("Compute", "Infrastructure", "Virtual Machines");
    cy.toolbar('Configuration', 'Edit this VM');
  });
});
